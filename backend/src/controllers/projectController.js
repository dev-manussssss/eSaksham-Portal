import { supabase } from '../supabase.js';
import { isValidSector, MPLADS_SECTORS } from '../constants/sectors.js';
import { PROJECT_STATUS, isValidTransition } from '../constants/statuses.js';
import { canPerformAction, ROLES } from '../middleware/rbac.js';
import { extractDocumentData } from '../ai/extractor.js';
import { runDeterministicChecks } from '../ai/ruleEngine.js';
import { analyzeWithGroqFailover } from '../ai/groqFailover.js';

export async function getProjects(req, res) {
  try {
    const { status, sector, district, search } = req.query;
    const user = req.user;

    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    // IDOR / Scoping rules (AUD-008)
    if (user.role === ROLES.VENDOR && user.vendorId) {
      query = query.eq('vendor_id', user.vendorId);
    } else if (user.role === ROLES.DISTRICT_AUTHORITY && user.district && user.district !== 'All Districts') {
      query = query.eq('district', user.district);
    }

    if (status) query = query.eq('status', status);
    if (sector) query = query.eq('sector', sector);
    if (district) query = query.eq('district', district);
    if (search) query = query.or(`title.ilike.%${search}%,project_code.ilike.%${search}%,mp_name.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, count: data.length, projects: data });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projErr || !project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    // IDOR verification
    if (user.role === ROLES.VENDOR && user.vendorId && project.vendor_id !== user.vendorId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this project.' });
    }

    // Parallel fetch related domain records
    const [
      { data: boqItems },
      { data: measurements },
      { data: bills },
      { data: documents },
      { data: aiFlags },
      { data: statusHistory },
      { data: inspections },
    ] = await Promise.all([
      supabase.from('boq_items').select('*').eq('project_id', id).order('item_no'),
      supabase.from('measurements').select('*').eq('project_id', id).order('entry_date', { ascending: false }),
      supabase.from('bills').select('*').eq('project_id', id).order('bill_date', { ascending: false }),
      supabase.from('project_documents').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('ai_flags').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('project_status_history').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('inspections').select('*').eq('project_id', id).order('inspection_date', { ascending: false }),
    ]);

    res.json({
      success: true,
      project: {
        ...project,
        boq_items: boqItems || [],
        measurements: measurements || [],
        bills: bills || [],
        documents: documents || [],
        ai_flags: aiFlags || [],
        status_history: statusHistory || [],
        inspections: inspections || [],
      },
    });
  } catch (err) {
    console.error('Error fetching project detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function recommendProject(req, res) {
  try {
    const user = req.user;
    const { title, sector, sanctioned_amount, constituency, district, state, description } = req.body;

    if (!title || !sector || !sanctioned_amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required recommendation fields (title, sector, sanctioned_amount).',
      });
    }

    // Mandatory MPLADS 12-Sector verification
    if (!isValidSector(sector)) {
      return res.status(400).json({
        success: false,
        error: `Invalid MPLADS sector '${sector}'. Must select one of the 12 canonical sectors.`,
        validSectors: MPLADS_SECTORS,
      });
    }

    const projectId = `PRJ-${Date.now().toString().slice(-6)}`;
    const projectCode = `MPLADS/${(state || user.state || 'IND').slice(0, 2).toUpperCase()}/${(district || user.district || 'DST').slice(0, 3).toUpperCase()}/${Date.now().toString().slice(-4)}`;

    const newProject = {
      id: projectId,
      project_code: projectCode,
      title: title.trim(),
      sector,
      category: sector,
      scheme: 'MPLADS',
      mp_name: user.name || 'Hon. Member of Parliament',
      constituency: constituency || user.constituency || 'Constituency',
      district: district || user.district || 'District',
      state: state || user.state || 'State',
      sanctioned_amount: Number(sanctioned_amount),
      released_amount: 0,
      expenditure_amount: 0,
      physical_progress_percent: 0,
      financial_progress_percent: 0,
      status: PROJECT_STATUS.RECOMMENDED,
      risk_level: 'LOW',
      risk_score: 5,
      inspection_note: description || 'Recommended under MP constituency allocation.',
      start_date: new Date().toISOString().split('T')[0],
      target_completion_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
    if (error) throw error;

    // Record immutable audit event (AUD-022)
    await supabase.from('audit_logs').insert({
      project_id: projectId,
      entity_type: 'PROJECT',
      entity_id: projectId,
      actor_id: user.id,
      role: user.role,
      action: 'RECOMMENDATION_CREATED',
      new_status: PROJECT_STATUS.RECOMMENDED,
      comment: `Project recommended in sector '${sector}' for ₹${Number(sanctioned_amount).toLocaleString('en-IN')}`,
    });

    res.status(201).json({ success: true, project: data });
  } catch (err) {
    console.error('Error recommending project:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function executeAction(req, res) {
  try {
    const { id } = req.params;
    const { action_type, decision, notes, target_status } = req.body;
    const user = req.user;

    // RBAC check
    if (!canPerformAction(user.role, action_type)) {
      return res.status(403).json({
        success: false,
        error: `Role '${user.role}' is not authorized to perform action '${action_type}'.`,
      });
    }

    const { data: project, error: fetchErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const currentStatus = project.status;
    let nextStatus = currentStatus;

    if (target_status) {
      if (!isValidTransition(currentStatus, target_status)) {
        return res.status(400).json({
          success: false,
          error: `Statutory transition from '${currentStatus}' to '${target_status}' is not permitted by MPLADS workflow rules.`,
        });
      }
      nextStatus = target_status;
    }

    // Update project status if transition specified
    if (nextStatus !== currentStatus) {
      await supabase
        .from('projects')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      await supabase.from('project_status_history').insert({
        project_id: id,
        previous_status: currentStatus,
        new_status: nextStatus,
        changed_by: user.id,
        changed_by_role: user.role,
        reason: notes || `Action: ${action_type}`,
      });
    }

    // Record human authoritative action
    await supabase.from('human_actions').insert({
      project_id: id,
      actor_id: user.id,
      actor_role: user.role,
      action_type,
      decision: decision || 'AUTHORIZED',
      notes: notes || '',
    });

    // Append to immutable audit logs
    await supabase.from('audit_logs').insert({
      project_id: id,
      entity_type: 'PROJECT',
      entity_id: id,
      actor_id: user.id,
      role: user.role,
      action: action_type,
      previous_status: currentStatus,
      new_status: nextStatus,
      comment: notes || `Authoritative decision: ${decision || action_type}`,
    });

    res.json({
      success: true,
      message: `Action '${action_type}' recorded successfully.`,
      project_id: id,
      status: nextStatus,
    });
  } catch (err) {
    console.error('Error executing project action:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function uploadDocument(req, res) {
  try {
    const { id } = req.params;
    const file = req.file;
    const { document_category } = req.body;
    const user = req.user;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file document uploaded.' });
    }

    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projErr || !project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    // 1. Sanitize & extract document data (AUD-014)
    const { rawText, extracted } = await extractDocumentData(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    // 2. Fetch project context
    const { data: boqItems } = await supabase.from('boq_items').select('*').eq('project_id', id);
    const { data: measurements } = await supabase.from('measurements').select('*').eq('project_id', id);

    // 3. Persist document record
    const { data: docRecord, error: docErr } = await supabase
      .from('project_documents')
      .insert({
        project_id: id,
        uploaded_by: user.id,
        uploader_role: user.role,
        file_name: file.originalname,
        file_type: file.mimetype,
        storage_path: `uploads/${id}/${Date.now()}_${file.originalname}`,
        document_category: document_category || 'INVOICE_BILL',
        file_size: file.size,
      })
      .select()
      .single();

    if (docErr) throw docErr;

    // 4. Deterministic rules engine execution
    const ruleResult = runDeterministicChecks({
      project,
      boqItems: boqItems || [],
      measurements: measurements || [],
      extractedData: extracted,
    });

    // 5. Groq AI Analysis with dual-key failover & taxonomy validation (AUD-023)
    const aiResult = await analyzeWithGroqFailover({
      project,
      boqItems: boqItems || [],
      ruleResult,
      extractedData: extracted,
      extractedText: rawText,
    });

    // 6. Record AI analysis run
    await supabase.from('ai_analysis_runs').insert({
      project_id: id,
      document_id: docRecord.id,
      model_name: aiResult.model,
      execution_status: aiResult.status,
      extracted_data: extracted,
      rules_triggered: ruleResult.flags,
      llm_assessment: aiResult.data,
    });

    // 7. Persist AI Flags as advisory recommendations
    const allFlags = [...ruleResult.flags, ...(aiResult.data?.flags || [])];
    const newFlags = allFlags.map(f => ({
      project_id: id,
      document_id: docRecord.id,
      flag_code: f.flag_code,
      severity: f.severity,
      title: f.title,
      explanation: f.explanation,
      recommended_action: f.recommended_action || aiResult.data?.recommended_action || 'REQUEST_VERIFICATION',
      primary_evidence: f.primary_evidence || { document_name: file.originalname },
      status: 'ACTIVE',
    }));

    if (newFlags.length > 0) {
      await supabase.from('ai_flags').insert(newFlags);
    }

    // AUD-015 FIX: AI DOES NOT AUTONOMOUSLY CHANGE PROJECT STATUS!
    // The status is left untouched. An alert/notification is generated for statutory officers.
    const updatedRiskScore = ruleResult.calculatedRiskScore;
    const updatedRiskLevel = ruleResult.calculatedRiskLevel;

    await supabase
      .from('projects')
      .update({
        risk_score: updatedRiskScore,
        risk_level: updatedRiskLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Append to audit log
    await supabase.from('audit_logs').insert({
      project_id: id,
      entity_type: 'DOCUMENT',
      entity_id: docRecord.id,
      actor_id: user.id,
      role: user.role,
      action: 'DOCUMENT_UPLOADED',
      comment: `Uploaded '${file.originalname}' (${file.size} bytes). AI identified ${newFlags.length} advisory flag(s). Human review required.`,
    });

    res.json({
      success: true,
      message: 'Document analyzed and stored with verifiable evidence.',
      document: docRecord,
      ai_assessment: {
        model: aiResult.model,
        risk_level: updatedRiskLevel,
        flags_count: newFlags.length,
        flags: newFlags,
        status_maintained: project.status, // Unchanged by AI
      },
    });
  } catch (err) {
    console.error('Error processing document:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function recordInspection(req, res) {
  try {
    const { id } = req.params;
    const {
      milestone_stage,
      physical_progress_observed,
      quality_assessment,
      remarks,
      cadastral_boundary_verified,
      latitude,
      longitude,
    } = req.body;
    const user = req.user;

    if (!milestone_stage || physical_progress_observed === undefined) {
      return res.status(400).json({
        success: false,
        error: 'milestone_stage and physical_progress_observed are required.',
      });
    }

    const inspectionDate = new Date().toISOString().split('T')[0];

    // 1. Insert into inspections table
    const { data: inspection, error: insErr } = await supabase
      .from('inspections')
      .insert({
        project_id: id,
        inspector_id: user.id,
        inspector_name: user.name || 'Statutory Inspector',
        inspection_date: inspectionDate,
        milestone_stage,
        physical_progress_observed: Number(physical_progress_observed),
        quality_assessment: quality_assessment || 'SATISFACTORY',
        remarks: remarks || '',
        cadastral_boundary_verified: cadastral_boundary_verified !== false,
        latitude: latitude ? Number(latitude) : 23.2599,
        longitude: longitude ? Number(longitude) : 77.4126,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    // 2. Update project record
    await supabase
      .from('projects')
      .update({
        last_inspection_date: inspectionDate,
        physical_progress_percent: Number(physical_progress_observed),
        inspection_note: remarks || `Inspected by ${user.name}: ${quality_assessment}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // 3. Audit log
    await supabase.from('audit_logs').insert({
      project_id: id,
      entity_type: 'INSPECTION',
      entity_id: inspection.id,
      actor_id: user.id,
      role: user.role,
      action: 'INSPECTION_RECORDED',
      comment: `Inspection recorded by ${user.name}. Progress: ${physical_progress_observed}%, Quality: ${quality_assessment || 'SATISFACTORY'}`,
    });

    res.status(201).json({ success: true, inspection });
  } catch (err) {
    console.error('Error recording inspection:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

