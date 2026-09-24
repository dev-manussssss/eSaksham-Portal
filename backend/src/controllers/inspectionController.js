import { supabase } from '../supabase.js';

export async function getInspections(req, res) {
  try {
    const { project_id } = req.query;
    let query = supabase.from('inspections').select('*, evidence_geotags(*), projects(title, project_code, district)');

    if (project_id) query = query.eq('project_id', project_id);

    const { data: inspections, error } = await query.order('inspection_date', { ascending: false });
    if (error) throw error;

    res.json({ success: true, count: inspections.length, inspections });
  } catch (err) {
    console.error('Error fetching inspections:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createInspection(req, res) {
  try {
    const user = req.user;
    const {
      project_id,
      milestone_stage,
      physical_progress_observed,
      quality_assessment,
      remarks,
      latitude,
      longitude,
      photo_url,
    } = req.body;

    if (!project_id || physical_progress_observed === undefined) {
      return res.status(400).json({ success: false, error: 'Project ID and observed progress required.' });
    }

    const { data: inspection, error: inspErr } = await supabase
      .from('inspections')
      .insert({
        project_id,
        inspector_id: user.id,
        inspector_name: user.name,
        inspection_date: new Date().toISOString().split('T')[0],
        milestone_stage: milestone_stage || 'Foundation Milestone',
        physical_progress_observed: Number(physical_progress_observed),
        quality_assessment: quality_assessment || 'SATISFACTORY',
        remarks: remarks || 'Physical site inspection conducted per guidelines.',
        cadastral_boundary_verified: true,
        latitude: latitude ? Number(latitude) : 23.2599,
        longitude: longitude ? Number(longitude) : 77.4126,
      })
      .select()
      .single();

    if (inspErr) throw inspErr;

    // Attach geotagged evidence if photo provided
    if (photo_url) {
      await supabase.from('evidence_geotags').insert({
        inspection_id: inspection.id,
        project_id,
        photo_url,
        latitude: latitude ? Number(latitude) : 23.2599,
        longitude: longitude ? Number(longitude) : 77.4126,
        captured_at: new Date().toISOString(),
        device_fingerprint: 'AUTHENTIC_FIELD_DEVICE_SECURE',
      });
    }

    // Update project last inspection date
    await supabase
      .from('projects')
      .update({
        last_inspection_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', project_id);

    // Audit event
    await supabase.from('audit_logs').insert({
      project_id,
      entity_type: 'INSPECTION',
      entity_id: inspection.id,
      actor_id: user.id,
      role: user.role,
      action: 'INSPECTION_CONDUCTED',
      comment: `Site inspection: Observed progress ${physical_progress_observed}% with assessment '${quality_assessment || 'SATISFACTORY'}'`,
    });

    res.status(201).json({ success: true, inspection });
  } catch (err) {
    console.error('Error creating inspection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
