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
      // Privileged roles (Central, State, Investigator, District Authority)
      if (project_id) query = query.eq('project_id', project_id);
      if (entity_type) query = query.eq('entity_type', entity_type);
      if (entity_id) query = query.eq('entity_id', entity_id);

      // District Authority scoped to district if specified
      if (user.role === ROLES.DISTRICT_AUTHORITY && user.district && user.district !== 'All Districts' && !project_id) {
        const { data: districtProjects } = await supabase
          .from('projects')
          .select('id')
          .ilike('district', `%${user.district}%`);
        const projectIds = (districtProjects || []).map(p => p.id);
        if (projectIds.length > 0) {
          query = query.or(`project_id.in.(${projectIds.join(',')}),actor_id.eq.${user.id}`);
        }
      }
    } else if (user.role === ROLES.VENDOR) {
      // Vendors: only see audit events concerning their own vendor entity_id or actor_id
      if (!user.vendorId) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view audit events.' });
      }
      query = query.or(`entity_id.eq.${user.vendorId},actor_id.eq.${user.id}`);
    } else if (user.role === ROLES.MP) {
      // MP: see audit logs for projects in their constituency or initiated by them
      if (project_id) {
        query = query.eq('project_id', project_id);
      } else if (user.constituency) {
        const { data: mpProjects } = await supabase
          .from('projects')
          .select('id')
          .ilike('constituency', `%${user.constituency}%`);
        const projectIds = (mpProjects || []).map(p => p.id);
        if (projectIds.length > 0) {
          query = query.or(`project_id.in.(${projectIds.join(',')}),actor_id.eq.${user.id}`);
        } else {
          return res.json({ success: true, count: 0, logs: [] });
        }
      } else {
        query = query.eq('actor_id', user.id);
      }
    } else if (user.role === ROLES.IMPLEMENTING_AGENCY) {
      // Implementing Agency: see audit logs for projects in their district
      if (project_id) {
        query = query.eq('project_id', project_id);
      } else if (user.district) {
        const { data: iaProjects } = await supabase
          .from('projects')
          .select('id')
          .ilike('district', `%${user.district}%`);
        const projectIds = (iaProjects || []).map(p => p.id);
        if (projectIds.length > 0) {
          query = query.or(`project_id.in.(${projectIds.join(',')}),actor_id.eq.${user.id}`);
        } else {
          return res.json({ success: true, count: 0, logs: [] });
        }
      } else {
        query = query.eq('actor_id', user.id);
      }
    } else {
      return res.status(403).json({ success: false, error: 'Insufficient permissions to access audit logs.' });
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
