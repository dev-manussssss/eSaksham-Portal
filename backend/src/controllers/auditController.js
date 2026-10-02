import { supabase } from '../supabase.js';
import { canPerformAction, ROLES } from '../middleware/rbac.js';

export async function getAuditLogs(req, res) {
  try {
    const user = req.user;
    const { project_id, entity_type, entity_id } = req.query;
    // Clamp limit: max 500, default 100
    const limit = Math.min(Number(req.query.limit) || 100, 500);

    let query = supabase.from('audit_logs').select('*');

    if (canPerformAction(user.role, 'VIEW_FULL_AUDIT')) {
      // Privileged roles: filter by explicit query params only
      if (project_id) query = query.eq('project_id', project_id);
      if (entity_type) query = query.eq('entity_type', entity_type);
      if (entity_id) query = query.eq('entity_id', entity_id);
    } else if (user.role === ROLES.VENDOR) {
      // Vendors: only see audit events concerning their own vendor entity_id
      // This prevents a vendor from reading audit logs of other vendors/projects
      if (!user.vendorId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view audit events.' });
      }
      query = query.eq('entity_id', user.vendorId);
    } else {
      // IMPLEMENTING_AGENCY and MP can see project-scoped audit if project_id is provided
      if (project_id) {
        query = query.eq('project_id', project_id);
      } else {
        return res.status(403).json({ success: false, error: 'Insufficient permissions to access audit logs. Please provide a project_id filter.' });
      }
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
