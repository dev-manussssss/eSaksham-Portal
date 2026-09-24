import { supabase } from '../supabase.js';
import { ROLES } from '../middleware/rbac.js';

export async function getTenders(req, res) {
  try {
    const { status, search } = req.query;
    let query = supabase.from('tenders').select('*, vendors(company_name, longitudinal_risk_score, risk_level)');

    if (status) query = query.eq('status', status);
    if (search) query = query.or(`title.ilike.%${search}%,reference_no.ilike.%${search}%`);

    const { data: tenders, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, count: tenders.length, tenders });
  } catch (err) {
    console.error('Error fetching tenders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getTenderById(req, res) {
  try {
    const { id } = req.params;

    const { data: tender, error: tenderErr } = await supabase
      .from('tenders')
      .select('*, vendors(company_name, longitudinal_risk_score, risk_level)')
      .eq('id', id)
      .single();

    if (tenderErr || !tender) {
      return res.status(404).json({ success: false, error: 'Tender not found.' });
    }

    // Fetch associated bids and participants (AUD-011)
    const { data: bids } = await supabase
      .from('bids')
      .select('*, bid_participants(*, vendors(company_name, gstin, longitudinal_risk_score))')
      .eq('tender_id', id)
      .order('financial_quote', { ascending: true });

    res.json({
      success: true,
      tender: {
        ...tender,
        bids: bids || [],
      },
    });
  } catch (err) {
    console.error('Error fetching tender detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createTender(req, res) {
  try {
    const { reference_no, title, estimated_budget, state, district } = req.body;
    const user = req.user;

    if (!reference_no || !title || !estimated_budget) {
      return res.status(400).json({ success: false, error: 'Missing required tender fields.' });
    }

    const tenderId = `TND-${Date.now().toString().slice(-4)}`;

    const { data: newTender, error } = await supabase
      .from('tenders')
      .insert({
        id: tenderId,
        reference_no,
        title,
        scheme: 'MPLADS',
        estimated_budget: Number(estimated_budget),
        status: 'PUBLISHED',
        state: state || user.state || 'Madhya Pradesh',
        district: district || user.district || 'Bhopal',
      })
      .select()
      .single();

    if (error) throw error;

    // Audit event (AUD-022)
    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'TENDER',
      entity_id: tenderId,
      actor_id: user.id,
      role: user.role,
      action: 'TENDER_PUBLISHED',
      comment: `Published tender '${reference_no}' with budget ₹${Number(estimated_budget).toLocaleString('en-IN')}`,
    });

    res.status(201).json({ success: true, tender: newTender });
  } catch (err) {
    console.error('Error creating tender:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function submitBid(req, res) {
  try {
    const { id } = req.params; // tender_id
    const { financial_quote, technical_score } = req.body;
    const user = req.user;

    const vendorId = user.vendorId || req.body.vendor_id;
    if (!vendorId) {
      return res.status(400).json({ success: false, error: 'Vendor identifier required for bid submission.' });
    }

    const bidReference = `BID-${Date.now().toString().slice(-6)}`;

    // Insert bid
    const { data: bid, error: bidErr } = await supabase
      .from('bids')
      .insert({
        tender_id: id,
        bid_reference: bidReference,
        submission_date: new Date().toISOString(),
        financial_quote: Number(financial_quote),
        technical_score: technical_score ? Number(technical_score) : 85,
        status: 'SUBMITTED',
        ip_address: req.ip || '127.0.0.1',
      })
      .select()
      .single();

    if (bidErr) throw bidErr;

    // Insert bid participant
    await supabase.from('bid_participants').insert({
      bid_id: bid.id,
      vendor_id: vendorId,
      is_lead_bidder: true,
      consortium_share_percent: 100.0,
    });

    // Audit event
    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'BID',
      entity_id: bid.id,
      actor_id: user.id,
      role: user.role,
      action: 'BID_SUBMITTED',
      comment: `Vendor '${vendorId}' submitted bid '${bidReference}' quote ₹${Number(financial_quote).toLocaleString('en-IN')}`,
    });

    res.status(201).json({ success: true, bid });
  } catch (err) {
    console.error('Error submitting bid:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateTenderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const user = req.user;

    const VALID_STATUSES = [
      'DRAFT',
      'PUBLISHED',
      'CLOSING_SOON',
      'CLOSED',
      'EVALUATION_PENDING',
      'TECHNICAL_EVALUATION',
      'COMMERCIAL_EVALUATION',
      'AWARD_PENDING',
      'AWARDED',
      'CANCELLED',
    ];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid tender status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const { data: tender, error } = await supabase
      .from('tenders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'TENDER',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: `TENDER_STATUS_${status}`,
      comment: reason || `Tender status transitioned to '${status}' by ${user.role}`,
    });

    res.json({ success: true, tender });
  } catch (err) {
    console.error('Error updating tender status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function awardTender(req, res) {
  try {
    const { id } = req.params;
    const { bid_id, vendor_id, award_notes } = req.body;
    const user = req.user;

    if (!vendor_id) {
      return res.status(400).json({ success: false, error: 'Vendor ID required to award tender.' });
    }

    // 1. Update tender to AWARDED with awarded_vendor_id
    const { data: tender, error: tErr } = await supabase
      .from('tenders')
      .update({
        status: 'AWARDED',
        awarded_vendor_id: vendor_id,
      })
      .eq('id', id)
      .select()
      .single();

    if (tErr) throw tErr;

    // 2. If bid_id provided, mark bid as SELECTED and others as QUALIFIED/REJECTED
    if (bid_id) {
      await supabase.from('bids').update({ status: 'SELECTED' }).eq('id', bid_id);
      await supabase.from('bids').update({ status: 'NOT_AWARDED' }).eq('tender_id', id).neq('id', bid_id);
    }

    // 3. Audit trail
    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'TENDER',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: 'TENDER_AWARDED',
      comment: award_notes || `Awarded tender '${tender.reference_no}' to contractor '${vendor_id}'`,
    });

    res.json({ success: true, tender });
  } catch (err) {
    console.error('Error awarding tender:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

