import { supabase } from '../supabase.js';
import { ROLES } from '../middleware/rbac.js';
import { getVendorRiskScore, calculateVendorRiskScore } from '../vendorRiskEngine.js';

export async function getVendors(req, res) {
  try {
    const user = req.user;
    const includeDeactivated = req.query.include_deactivated === 'true';

    let query = supabase.from('vendors').select('*');

    // IDOR / Scoping rules (AUD-008)
    if (user.role === ROLES.VENDOR && user.vendorId) {
      query = query.eq('id', user.vendorId);
    } else {
      if (!includeDeactivated) {
        query = query.eq('is_active', true);
      }
    }

    if (req.query.limit) {
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
    }

    const { data: vendors, error } = await query.order('longitudinal_risk_score', { ascending: false });
    if (error) throw error;

    // Canonicalize company_name (AUD-029)
    const normalized = (vendors || []).map(v => ({
      ...v,
      company_name: v.company_name || v.name || 'Unnamed Vendor',
    }));

    res.json({ success: true, count: normalized.length, vendors: normalized });
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getVendorById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // IDOR check (AUD-008)
    if (user.role === ROLES.VENDOR && user.vendorId && user.vendorId !== id) {
      return res.status(403).json({
        success: false,
        error: 'Access restricted: Vendors may only inspect their own corporate profile.',
      });
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vendor) {
      return res.status(404).json({ success: false, error: 'Vendor record not found.' });
    }

    // Fetch related projects and bids
    const [{ data: projects }, { data: bidParticipations }] = await Promise.all([
      supabase.from('projects').select('*').eq('vendor_id', id),
      supabase.from('bid_participants').select('*, bids(*)').eq('vendor_id', id),
    ]);

    // Calculate explainable multi-factor risk score
    let riskReport = null;
    try {
      riskReport = await getVendorRiskScore(id);
    } catch (e) {
      console.warn(`Could not compute live risk score for ${id}:`, e.message);
    }

    res.json({
      success: true,
      vendor: {
        ...vendor,
        company_name: vendor.company_name || vendor.name,
        assigned_projects: projects || [],
        bids: bidParticipations || [],
        risk_assessment: riskReport,
      },
    });
  } catch (err) {
    console.error('Error fetching vendor detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateVendor(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const updates = req.sanitizedVendorUpdate; // Filtered by allowlist in validate.js (AUD-009)

    // IDOR protection
    if (user.role === ROLES.VENDOR && user.vendorId !== id) {
      return res.status(403).json({ success: false, error: 'Unauthorized vendor modification.' });
    }

    const { data: updatedVendor, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Record non-project audit event with nullable project_id (AUD-022)
    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'VENDOR',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: 'VENDOR_UPDATED',
      comment: `Updated corporate profile details for vendor '${id}'`,
      metadata: updates,
    });

    res.json({ success: true, vendor: updatedVendor });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function setBlacklistStatus(req, res) {
  try {
    const { id } = req.params;
    const { is_blacklisted, reason } = req.body;
    const user = req.user;

    if (typeof is_blacklisted !== 'boolean') {
      return res.status(400).json({ success: false, error: 'is_blacklisted must be boolean.' });
    }

    const { error: updateErr } = await supabase
      .from('vendors')
      .update({ is_blacklisted })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Dynamically recalculate multi-factor risk score using vendorRiskEngine
    let calculated = null;
    try {
      calculated = await calculateVendorRiskScore(id);
    } catch (calcErr) {
      console.warn(`Vendor risk recalculation fallback for ${id}:`, calcErr.message);
    }

    const risk_level = calculated ? calculated.severity : (is_blacklisted ? 'CRITICAL' : 'LOW');
    const longitudinal_risk_score = calculated ? calculated.composite_score : (is_blacklisted ? 100 : 25);

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({
        risk_level,
        longitudinal_risk_score,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Audit logging
    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'VENDOR',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: is_blacklisted ? 'VENDOR_BLACKLISTED' : 'VENDOR_REINSTATED',
      comment: reason || (is_blacklisted ? 'Vendor blacklisted by District Authority.' : 'Vendor de-blacklisted.'),
    });

    res.json({ success: true, vendor });
  } catch (err) {
    console.error('Error toggling blacklist status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createVendor(req, res) {
  try {
    const { company_name, gstin, pan, state, district, sector } = req.body;
    const user = req.user;

    if (!company_name || !gstin || !pan) {
      return res.status(400).json({ success: false, error: 'Company Name, GSTIN, and PAN are required.' });
    }

    const cleanGstin = gstin.trim().toUpperCase();
    const cleanPan = pan.trim().toUpperCase();

    // GSTIN basic format validation: 15 characters alphanumeric
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
      return res.status(400).json({
        success: false,
        error: `Invalid GSTIN format '${cleanGstin}'. Please enter a valid 15-character GSTIN as issued by GST authorities.`,
      });
    }

    // PAN basic format validation: 10 characters AAAAA9999A
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        error: `Invalid PAN format '${cleanPan}'. Please enter a valid 10-character Permanent Account Number.`,
      });
    }

    // Duplicate GSTIN check — must be unique across all vendors
    const { data: gstinExists } = await supabase
      .from('vendors')
      .select('id, company_name')
      .eq('gstin', cleanGstin)
      .maybeSingle();

    if (gstinExists) {
      return res.status(409).json({
        success: false,
        error: `GSTIN '${cleanGstin}' is already registered under vendor '${gstinExists.company_name}' (${gstinExists.id}). Each GSTIN must be unique in the MPLADS vendor registry.`,
      });
    }

    // Duplicate PAN check — must be unique across all vendors
    const { data: panExists } = await supabase
      .from('vendors')
      .select('id, company_name')
      .eq('pan', cleanPan)
      .maybeSingle();

    if (panExists) {
      return res.status(409).json({
        success: false,
        error: `PAN '${cleanPan}' is already registered under vendor '${panExists.company_name}' (${panExists.id}). Each PAN must be unique in the MPLADS vendor registry.`,
      });
    }

    // Collision-resistant vendor ID: timestamp slice + random 3 digits
    const vendorId = `VND-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 900 + 100)}`;
    const newVendor = {
      id: vendorId,
      company_name: company_name.trim(),
      gstin: cleanGstin,
      pan: cleanPan,
      state: state || user.state || 'Madhya Pradesh',
      district: district || user.district || 'Bhopal',
      sector: sector || 'Civil Infrastructure',
      longitudinal_risk_score: 25,
      risk_level: 'LOW',
      is_active: true,
      is_blacklisted: false,
    };

    const { data, error } = await supabase.from('vendors').insert([newVendor]).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'VENDOR',
      entity_id: vendorId,
      actor_id: user.id,
      role: user.role,
      action: 'VENDOR_CREATED',
      comment: `Onboarded vendor '${company_name}' (${vendorId}) with GSTIN ${cleanGstin} by ${user.role} ${user.name || user.id}`,
    });

    res.status(201).json({ success: true, vendor: data });
  } catch (err) {
    console.error('Error creating vendor:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function toggleSuspendVendor(req, res) {
  try {
    const { id } = req.params;
    const { is_active, reason } = req.body;
    const user = req.user;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, error: 'is_active boolean required.' });
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      project_id: null,
      entity_type: 'VENDOR',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: is_active ? 'VENDOR_REACTIVATED' : 'VENDOR_SUSPENDED',
      comment: reason || (is_active ? `Reactivated vendor '${id}'` : `Suspended vendor '${id}'`),
    });

    res.json({ success: true, vendor });
  } catch (err) {
    console.error('Error toggling suspend status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

