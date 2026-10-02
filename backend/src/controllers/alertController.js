import { supabase } from '../supabase.js';
import { canPerformAction } from '../middleware/rbac.js';

export async function getAlerts(req, res) {
  try {
    const { severity, category, status } = req.query;
    let query = supabase.from('alerts').select('*, projects(title, project_code), vendors(company_name)');

    if (severity) query = query.eq('severity', severity);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data: alerts, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function reviewAlert(req, res) {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    const user = req.user;

    // RBAC: Only District Authority and Investigator can resolve/dismiss alerts
    if (!canPerformAction(user.role, 'REQUEST_VERIFICATION')) {
      return res.status(403).json({
        success: false,
        error: 'Only District Authority and Investigator officers are authorized to review alert decisions.',
      });
    }

    const VALID_ALERT_STATUSES = ['ACTIVE', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
    const newStatus = status || 'RESOLVED';
    if (!VALID_ALERT_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid alert status '${newStatus}'. Must be one of: ${VALID_ALERT_STATUSES.join(', ')}`,
      });
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found.' });

    // Audit event
    await supabase.from('audit_logs').insert({
      project_id: alert.project_id || null,
      entity_type: 'ALERT',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: 'ALERT_REVIEWED',
      comment: resolution_notes || `Alert marked as ${newStatus} by ${user.role}`,
    });

    res.json({ success: true, alert });
  } catch (err) {
    console.error('Error reviewing alert:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

