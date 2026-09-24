import { supabase } from '../supabase.js';
import { ROLES } from '../middleware/rbac.js';
import { getVendorRiskScore } from '../vendorRiskEngine.js';

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

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({
        is_blacklisted,
        risk_level: is_blacklisted ? 'CRITICAL' : 'LOW',
        longitudinal_risk_score: is_blacklisted ? 95 : 30,
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

    const vendorId = `VND-${Date.now().toString().slice(-4)}`;
    const newVendor = {
      id: vendorId,
      company_name: company_name.trim(),
      gstin: gstin.trim().toUpperCase(),
      pan: pan.trim().toUpperCase(),
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
      comment: `Onboarded vendor '${company_name}' (${vendorId}) with GSTIN ${gstin}`,
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

