import { supabase } from '../supabase.js';
import { canPerformAction, ROLES } from '../middleware/rbac.js';

export async function getAuditLogs(req, res) {
  try {
    const user = req.user;
    const { project_id, entity_type, entity_id, limit = 100 } = req.query;

    // RBAC: Non-administrative users can only see events concerning their own scope
    if (!canPerformAction(user.role, 'VIEW_FULL_AUDIT')) {
      if (user.role === ROLES.VENDOR) {
        if (!user.vendorId) {
          return res.status(403).json({ success: false, error: 'Unauthorized to view audit events.' });
        }
      }
    }

    let query = supabase.from('audit_logs').select('*');

    if (project_id) query = query.eq('project_id', project_id);
    if (entity_type) query = query.eq('entity_type', entity_type);
    if (entity_id) query = query.eq('entity_id', entity_id);

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
