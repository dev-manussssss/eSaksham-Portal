import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { supabase } from './supabase.js';
import { canPerformAction, filterProjectsForRole, ROLES } from './rbac.js';
import { isValidTransition, PROJECT_STATUS } from './statusMachine.js';
import { extractDocumentData } from './ai/extractor.js';
import { runDeterministicChecks } from './ai/ruleEngine.js';
import { analyzeWithGroqFailover } from './ai/groqFailover.js';
import { seedDatabase } from './scripts/seedData.js';
import { getVendorRiskScore, calculateVendorRiskScore } from './vendorRiskEngine.js';

const app = express();

app.use(cors());
app.use(express.json());

// Ensure local uploads directory exists
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// ─── 1. HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'ONLINE';
  try {
    const { error } = await supabase.from('roles').select('role_key').limit(1);
    if (error) dbStatus = 'DEGRADED';
  } catch (e) {
    dbStatus = 'OFFLINE';
  }

  res.json({
    status: 'HEALTHY',
    service: 'SAKSHAM-BACKEND-GATEWAY',
    version: '1.0.0',
    database: dbStatus,
    aiFailoverActive: true,
    primaryKeyConfigured: Boolean(config.groqKey1),
    secondaryKeyConfigured: Boolean(config.groqKey2),
    timestamp: new Date().toISOString(),
  });
});

// ─── 2. GET PROJECTS (Role-scoped) ────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || req.query.role || ROLES.DISTRICT_AUTHORITY;
    const userDistrict = req.headers['x-saksham-district'] || req.query.district;
    const userVendorId = req.headers['x-saksham-vendor-id'] || req.query.vendorId;
    const userConstituency = req.headers['x-saksham-constituency'] || req.query.constituency;

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const filtered = filterProjectsForRole(projects, role, {
      district: userDistrict,
      vendorId: userVendorId,
      constituency: userConstituency,
    });

    res.json({ success: true, count: filtered.length, projects: filtered });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 3. GET SINGLE PROJECT DETAILS ────────────────────────────────────────────
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (pErr || !project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Fetch related records in parallel
    const [boqRes, mbRes, billsRes, flagsRes, docsRes, auditRes] = await Promise.all([
      supabase.from('boq_items').select('*').eq('project_id', id).order('item_no'),
      supabase.from('measurements').select('*').eq('project_id', id).order('entry_date'),
      supabase.from('bills').select('*').eq('project_id', id).order('bill_date'),
      supabase.from('ai_flags').select('*').eq('project_id', id).eq('status', 'ACTIVE'),
      supabase.from('project_documents').select('*').eq('project_id', id).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    ]);

    // Role-based filtering of sensitive audit / vendor details if caller is restricted Vendor
    const role = req.headers['x-saksham-role'] || req.query.role;
    let auditTrail = auditRes.data || [];
    if (role === ROLES.VENDOR) {
      auditTrail = auditTrail.filter(a => a.role === ROLES.VENDOR || a.action.includes('PAYMENT') || a.action.includes('SUBMITTED'));
    }

    res.json({
      success: true,
      project,
      boq_items: boqRes.data || [],
      measurements: mbRes.data || [],
      bills: billsRes.data || [],
      ai_flags: flagsRes.data || [],
      documents: docsRes.data || [],
      audit_logs: auditTrail,
    });
  } catch (err) {
    console.error('Error fetching project details:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 4. DOCUMENT UPLOAD & AI ANOMALY DETECTION PIPELINE ───────────────────────
app.post('/api/projects/:id/documents', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { documentCategory = 'Measurement Book', uploaderRole = 'IMPLEMENTING_AGENCY', uploadedBy = 'USER-AUTH' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No document file uploaded' });
    }

    // RBAC validation for document upload
    if (uploaderRole === ROLES.MP && !['Recommendation', 'Supporting Evidence'].includes(documentCategory)) {
      return res.status(403).json({ success: false, error: 'MPs are restricted to Recommendation documents only.' });
    }

    // Verify Project exists
    const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', id).single();
    if (pErr || !project) return res.status(404).json({ success: false, error: 'Project not found' });

    // 1. Save Document Storage
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `projects/${id}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage (fallback to local if storage bucket access policy issue)
    let finalStoragePath = storagePath;
    try {
      const { error: storageErr } = await supabase.storage
        .from('saksham-documents')
        .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: true });

      if (storageErr) {
        // Fallback to local storage
        const localFilePath = path.join(config.uploadsDir, `${timestamp}_${safeName}`);
        fs.writeFileSync(localFilePath, file.buffer);
        finalStoragePath = `/uploads/${timestamp}_${safeName}`;
      }
    } catch (e) {
      const localFilePath = path.join(config.uploadsDir, `${timestamp}_${safeName}`);
      fs.writeFileSync(localFilePath, file.buffer);
      finalStoragePath = `/uploads/${timestamp}_${safeName}`;
    }

    // 2. Insert document record in Postgres
    const { data: docRecord, error: docErr } = await supabase
      .from('project_documents')
      .insert({
        project_id: id,
        uploaded_by: uploadedBy,
        uploader_role: uploaderRole,
        file_name: file.originalname,
        file_type: file.mimetype || 'application/pdf',
        storage_path: finalStoragePath,
        document_category: documentCategory,
        upload_status: 'PROCESSED',
        file_size: file.size,
      })
      .select()
      .single();

    if (docErr) throw docErr;

    // 3. Extract Text and Structured Data
    const { rawText, extracted } = await extractDocumentData(file.buffer, file.mimetype, file.originalname);

    // Fetch existing BOQ & measurements to compare against
    const { data: boqItems } = await supabase.from('boq_items').select('*').eq('project_id', id);
    const { data: measurements } = await supabase.from('measurements').select('*').eq('project_id', id);

    // 4. Run Deterministic Rule Engine
    const ruleResult = runDeterministicChecks({
      project,
      boqItems: boqItems || [],
      measurements: measurements || [],
      extractedDocument: extracted,
    });

    // 5. Invoke Groq AI with Failover
    const aiResult = await analyzeWithGroqFailover({
      project,
      boqItems: boqItems || [],
      ruleResult,
      extractedData: extracted,
      extractedText: rawText,
    });

    // 6. Record AI Analysis Run
    const { data: runRecord } = await supabase
      .from('ai_analysis_runs')
      .insert({
        project_id: id,
        document_id: docRecord.id,
        model_name: aiResult.model,
        execution_status: aiResult.status,
        extracted_data: extracted,
        rules_triggered: ruleResult.flags,
        llm_assessment: aiResult.data,
      })
      .select()
      .single();

    // 7. Save Generated Flags
    const newFlags = (aiResult.data.flags || ruleResult.flags).map(f => ({
      project_id: id,
      document_id: docRecord.id,
      analysis_run_id: runRecord?.id,
      flag_code: f.flag_code,
      severity: f.severity || 'HIGH',
      title: f.title,
      explanation: f.explanation,
      recommended_action: f.recommended_action || aiResult.data.recommended_action || 'REQUEST_VERIFICATION',
      primary_evidence: f.primary_evidence || { document_name: file.originalname },
      status: 'ACTIVE',
    }));

    if (newFlags.length > 0) {
      await supabase.from('ai_flags').insert(newFlags);
    }

    // 8. Update Project Risk and Status if Critical
    const updatedRiskScore = ruleResult.calculatedRiskScore;
    const updatedRiskLevel = ruleResult.calculatedRiskLevel;
    const hasCriticalFlag = newFlags.some(f => f.severity === 'CRITICAL');

    let updatedStatus = project.status;
    if (hasCriticalFlag && project.status !== PROJECT_STATUS.ON_HOLD) {
      updatedStatus = PROJECT_STATUS.INSPECTION_REQUIRED;
    }

    await supabase
      .from('projects')
      .update({
        risk_score: updatedRiskScore,
        risk_level: updatedRiskLevel,
        status: updatedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // 9. Append to Immutable Audit Logs
    await supabase.from('audit_logs').insert([
      {
        project_id: id,
        actor_id: uploadedBy,
        role: uploaderRole,
        action: 'DOCUMENT_UPLOADED',
        previous_status: project.status,
        new_status: project.status,
        comment: `Uploaded ${documentCategory}: "${file.originalname}" (${(file.size / 1024).toFixed(1)} KB).`,
        related_id: docRecord.id,
      },
      ...(newFlags.length > 0 ? [{
        project_id: id,
        actor_id: 'SYSTEM_AI',
        role: 'SYSTEM',
        action: 'AI_ANOMALY_FLAGGED',
        previous_status: project.status,
        new_status: updatedStatus,
        comment: `AI Analysis (${aiResult.model}): Triggered ${newFlags.length} flag(s). Recommendation: ${aiResult.data.recommended_action}.`,
        related_id: docRecord.id,
      }] : []),
    ]);

    res.json({
      success: true,
      document: docRecord,
      extraction: extracted,
      ruleResult,
      aiAssessment: aiResult,
      flagsCreated: newFlags,
      updatedProject: {
        id,
        status: updatedStatus,
        risk_level: updatedRiskLevel,
        risk_score: updatedRiskScore,
      },
    });
  } catch (err) {
    console.error('Document processing error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 5. HUMAN-IN-THE-LOOP ACTIONS ─────────────────────────────────────────────
app.post('/api/projects/:id/actions', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, actorId = 'USER', actorRole, notes = '', relatedFlagId } = req.body;

    // Validate Permission
    if (!canPerformAction(actorRole, action)) {
      return res.status(403).json({
        success: false,
        error: `Permission Denied: Role "${actorRole}" is not authorized to execute action "${action}".`,
      });
    }

    const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', id).single();
    if (pErr || !project) return res.status(404).json({ success: false, error: 'Project not found' });

    let targetStatus = project.status;
    let decisionDescription = notes || action;

    switch (action) {
      case 'PUT_ON_HOLD':
        targetStatus = PROJECT_STATUS.ON_HOLD;
        decisionDescription = notes || 'Administrative Hold Placed: Pending resolution of inspection/financial flags.';
        break;
      case 'CLEAR_HOLD':
        targetStatus = PROJECT_STATUS.UNDER_IMPLEMENTATION;
        decisionDescription = notes || 'Hold Released: Administrative clarification received and verified.';
        break;
      case 'REQUEST_VERIFICATION':
        targetStatus = PROJECT_STATUS.INSPECTION_REQUIRED;
        decisionDescription = notes || 'Physical Verification Mandated: Independent engineer inspection scheduled.';
        break;
      case 'MARK_VERIFIED':
        targetStatus = PROJECT_STATUS.VERIFIED;
        decisionDescription = notes || 'Physical Milestone Verified: Ground inspection verified as compliant.';
        break;
      case 'APPROVE':
        targetStatus = PROJECT_STATUS.SANCTIONED;
        decisionDescription = notes || 'Sanction Order Approved by District Authority.';
        break;
      case 'REJECT':
        targetStatus = PROJECT_STATUS.REJECTED;
        decisionDescription = notes || 'Project Rejected by Competent Authority.';
        break;
      case 'SUBMIT_FOR_INSPECTION':
        targetStatus = PROJECT_STATUS.INSPECTION_REQUIRED;
        decisionDescription = notes || 'Work Submitted for Statutory Inspection by Implementing Agency.';
        break;
      case 'ADD_AUDIT_NOTE':
        decisionDescription = notes || 'Auditor observation recorded.';
        break;
      default:
        break;
    }

    // Verify State Machine Transition Validity
    if (!isValidTransition(project.status, targetStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status transition from "${project.status}" to "${targetStatus}".`,
      });
    }

    // Update Project Status in Supabase
    const { data: updatedProject, error: updateErr } = await supabase
      .from('projects')
      .update({
        status: targetStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Insert Human Action Record
    await supabase.from('human_actions').insert({
      project_id: id,
      actor_id: actorId,
      actor_role: actorRole,
      action_type: action,
      decision: targetStatus,
      notes: decisionDescription,
      related_flag_id: relatedFlagId || null,
    });

    // If relatedFlagId provided, mark flag as resolved/under_review
    if (relatedFlagId) {
      const flagStatus = action === 'CLEAR_HOLD' ? 'RESOLVED' : 'UNDER_REVIEW';
      await supabase
        .from('ai_flags')
        .update({
          status: flagStatus,
          resolved_by: actorId,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', relatedFlagId);
    }

    // Append to Immutable Audit Log
    await supabase.from('audit_logs').insert({
      project_id: id,
      actor_id: actorId,
      role: actorRole,
      action: action,
      previous_status: project.status,
      new_status: targetStatus,
      comment: decisionDescription,
      related_id: relatedFlagId || null,
    });

    res.json({
      success: true,
      action,
      previousStatus: project.status,
      newStatus: targetStatus,
      project: updatedProject,
    });
  } catch (err) {
    console.error('Error executing human action:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 6. AUDIT TRAIL QUERY (Role-Scoped) ───────────────────────────────────────
app.get('/api/projects/:id/audit-trail', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-saksham-role'] || req.query.role || ROLES.DISTRICT_AUTHORITY;

    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Role-based visibility enforcement
    let filteredLogs = auditLogs || [];
    if (role === ROLES.VENDOR) {
      filteredLogs = filteredLogs.filter(a => a.role === ROLES.VENDOR || a.action.includes('PAYMENT') || a.action.includes('SUBMITTED'));
    }

    res.json({ success: true, audit_trail: filteredLogs });
  } catch (err) {
    console.error('Error fetching audit trail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 7. RE-SEED DEMO DATABASE ────────────────────────────────────────────────
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database successfully seeded with 10 synthetic projects.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 8. VENDOR MANAGEMENT ───────────────────────────────────────────────────
app.get('/api/vendors', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    const vendorId = req.headers['x-saksham-vendor-id'];
    const includeDeactivated = req.query.include_deactivated === 'true';

    let query = supabase.from('vendors').select('*');

    // Role-based visibility scoping
    if (role === ROLES.VENDOR && vendorId) {
      query = query.eq('id', vendorId);
    } else if (!includeDeactivated || role !== ROLES.DISTRICT_AUTHORITY) {
      // By default, exclude soft-deactivated vendors unless District Authority explicitly requests them
      query = query.or('is_active.is.null,is_active.eq.true');
    }

    const { data: vendors, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Attach active project counts and latest risk scores
    const { data: projects } = await supabase.from('projects').select('id, vendor_id, status');
    const projectMap = {};
    (projects || []).forEach(p => {
      if (p.vendor_id) {
        projectMap[p.vendor_id] = (projectMap[p.vendor_id] || 0) + 1;
      }
    });

    const enrichedVendors = (vendors || []).map(v => ({
      ...v,
      company_name: v.company_name || v.name,
      active_projects_count: projectMap[v.id] || 0,
    }));

    res.json({ success: true, vendors: enrichedVendors });
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    const vendorId = req.headers['x-saksham-vendor-id'];

    if (role === ROLES.VENDOR && vendorId && vendorId !== id) {
      return res.status(403).json({ success: false, error: 'Access restricted to own vendor record' });
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Fetch projects linked to this vendor
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('vendor_id', id);

    // Fetch latest risk score if available
    const { data: riskScore } = await supabase
      .from('vendor_risk_scores')
      .select('*')
      .eq('vendor_id', id)
      .eq('is_latest', true)
      .maybeSingle();

    res.json({
      success: true,
      vendor: {
        ...vendor,
        company_name: vendor.company_name || vendor.name,
      },
      projects: projects || [],
      risk_score: riskScore || null,
    });
  } catch (err) {
    console.error('Error fetching vendor detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    if (!canPerformAction(role, 'CREATE_VENDOR')) {
      return res.status(403).json({ success: false, error: 'Role not authorized to create vendors' });
    }

    const {
      company_name,
      name,
      gstin,
      pan,
      registered_address,
      district,
      state,
      sector,
      director_dins,
      bank_account_hash,
    } = req.body;

    const vendorName = company_name || name;
    if (!vendorName || !gstin) {
      return res.status(400).json({ success: false, error: 'Company name and GSTIN are required' });
    }

    const newId = req.body.id || `VND-${Date.now().toString().slice(-4)}`;

    const newVendor = {
      id: newId,
      name: vendorName,
      company_name: vendorName,
      gstin,
      pan: pan || null,
      registered_address: registered_address || null,
      district: district || null,
      state: state || null,
      sector: sector || 'General Civil Works',
      director_dins: Array.isArray(director_dins) ? director_dins : [],
      bank_account_hash: bank_account_hash || null,
      is_blacklisted: false,
      is_active: true,
    };

    const { data, error } = await supabase.from('vendors').insert(newVendor).select().single();
    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: req.headers['x-saksham-user-id'] || 'system',
      role,
      action: 'VENDOR_CREATED',
      project_id: null,
      comments: `Created vendor ${vendorName} (${newId})`,
    });

    res.status(201).json({ success: true, vendor: data });
  } catch (err) {
    console.error('Error creating vendor:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    if (!canPerformAction(role, 'EDIT_VENDOR')) {
      return res.status(403).json({ success: false, error: 'Role not authorized to edit vendors' });
    }

    const updates = { ...req.body };
    delete updates.id; // Prevent PK modification
    delete updates.created_at;

    if (updates.company_name && !updates.name) updates.name = updates.company_name;
    if (updates.name && !updates.company_name) updates.company_name = updates.name;

    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      actor_id: req.headers['x-saksham-user-id'] || 'system',
      role,
      action: 'VENDOR_UPDATED',
      project_id: null,
      comments: `Updated vendor details for ${id}`,
    });

    res.json({ success: true, vendor: data });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/vendors/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    if (!canPerformAction(role, 'DEACTIVATE_VENDOR')) {
      return res.status(403).json({ success: false, error: 'Only District Authority may deactivate vendors' });
    }

    const reason = req.body.reason || 'Deactivated by administrative order';

    // Soft-deactivate: NEVER hard-delete
    const { data, error } = await supabase
      .from('vendors')
      .update({
        is_active: false,
        deactivated_by: role,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Record auditable action
    await supabase.from('audit_logs').insert({
      actor_id: req.headers['x-saksham-user-id'] || 'system',
      role,
      action: 'VENDOR_DEACTIVATED',
      project_id: null,
      comments: `Soft-deactivated vendor ${id}. Reason: ${reason}`,
    });

    res.json({ success: true, message: `Vendor ${id} soft-deactivated successfully`, vendor: data });
  } catch (err) {
    console.error('Error deactivating vendor:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 9. VENDOR RISK SCORING ─────────────────────────────────────────────────
app.get('/api/vendors/:id/risk-score', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    if (!canPerformAction(role, 'VIEW_VENDOR_RISK')) {
      return res.status(403).json({ success: false, error: 'Role not authorized to view vendor risk assessments' });
    }

    const riskScore = await getVendorRiskScore(id);
    res.json({ success: true, risk_score: riskScore });
  } catch (err) {
    console.error('Error fetching vendor risk score:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/vendors/:id/risk-score/recalculate', async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    if (!canPerformAction(role, 'VIEW_VENDOR_RISK')) {
      return res.status(403).json({ success: false, error: 'Role not authorized to calculate vendor risk assessments' });
    }

    const freshScore = await calculateVendorRiskScore(id);
    res.json({ success: true, risk_score: freshScore, message: 'Recalculated from latest operational records' });
  } catch (err) {
    console.error('Error recalculating vendor risk score:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 10. TENDER MONITORING ──────────────────────────────────────────────────
app.get('/api/tenders', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    const vendorId = req.headers['x-saksham-vendor-id'];
    const ownOnly = req.query.own === 'true';

    let query = supabase.from('tenders').select('*');

    if (role === ROLES.VENDOR && ownOnly && vendorId) {
      query = query.eq('awarded_vendor_id', vendorId);
    }

    const { data: tenders, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, tenders: tenders || [] });
  } catch (err) {
    console.error('Error fetching tenders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tenders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: tender, error } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tender) {
      return res.status(404).json({ success: false, error: 'Tender not found' });
    }

    let vendor = null;
    if (tender.awarded_vendor_id) {
      const { data: v } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', tender.awarded_vendor_id)
        .maybeSingle();
      vendor = v;
    }

    res.json({ success: true, tender, awarded_vendor: vendor });
  } catch (err) {
    console.error('Error fetching tender detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tenders', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || ROLES.IMPLEMENTING_AGENCY;
    if (!canPerformAction(role, 'CREATE_TENDER')) {
      return res.status(403).json({ success: false, error: 'Role not authorized to publish tenders' });
    }

    const newId = req.body.id || `TND-${Date.now().toString().slice(-4)}`;
    const tenderData = {
      id: newId,
      reference_no: req.body.reference_no || req.body.tender_reference || `TND/REF/${newId}`,
      title: req.body.title,
      estimated_budget: req.body.estimated_budget || req.body.estimated_amount || 0,
      awarded_vendor_id: req.body.awarded_vendor_id || null,
      district: req.body.district || null,
      state: req.body.state || null,
      status: req.body.status || 'OPEN',
    };

    const { data, error } = await supabase.from('tenders').insert(tenderData).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      actor_id: req.headers['x-saksham-user-id'] || 'system',
      role,
      action: 'TENDER_PUBLISHED',
      project_id: null,
      comments: `Published tender ${tenderData.title} (${newId})`,
    });

    res.status(201).json({ success: true, tender: data });
  } catch (err) {
    console.error('Error creating tender:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 11. INVESTIGATIONS & AUDIT ALERTS ──────────────────────────────────────
app.get('/api/investigations', async (req, res) => {
  try {
    // Collect active investigation items from ai_flags + stalled projects
    const { data: flags, error: flagErr } = await supabase
      .from('ai_flags')
      .select('*')
      .in('severity', ['HIGH', 'CRITICAL'])
      .neq('status', 'RESOLVED')
      .order('created_at', { ascending: false });

    if (flagErr) throw flagErr;

    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, district, state, vendor_id, status');

    const projMap = {};
    (projects || []).forEach(p => { projMap[p.id] = p; });

    const investigations = (flags || []).map(f => {
      const proj = projMap[f.project_id] || {};
      return {
        id: `INV-${f.id.slice(0, 8)}`,
        flag_id: f.id,
        project_id: f.project_id,
        project_title: proj.title || 'Unknown Project',
        district: proj.district || 'Unassigned',
        state: proj.state || '',
        vendor_id: proj.vendor_id || null,
        flag_code: f.flag_code,
        severity: f.severity,
        trigger_reason: f.reason,
        status: f.status || 'OPEN',
        evidence_reference: f.source_field || 'System Anomaly Detection',
        opened_at: f.created_at,
      };
    });

    res.json({ success: true, investigations });
  } catch (err) {
    console.error('Error fetching investigations:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/investigations', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    if (!canPerformAction(role, 'OPEN_INVESTIGATION')) {
      return res.status(403).json({ success: false, error: 'Role not authorized to open formal investigations' });
    }

    const { project_id, reason, severity, flag_code } = req.body;
    if (!project_id) {
      return res.status(400).json({ success: false, error: 'project_id is required' });
    }

    const { data: flag, error } = await supabase
      .from('ai_flags')
      .insert({
        project_id,
        flag_code: flag_code || 'INVESTIGATION_OPENED',
        severity: severity || 'HIGH',
        reason: reason || 'Formal inquiry initiated by authority',
        source_field: 'Human Statutory Investigator',
        status: 'OPEN',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      actor_id: req.headers['x-saksham-user-id'] || 'system',
      role,
      action: 'INVESTIGATION_OPENED',
      project_id,
      comments: `Investigation initiated: ${reason}`,
    });

    res.status(201).json({ success: true, investigation: flag });
  } catch (err) {
    console.error('Error creating investigation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 12. DASHBOARD AGGREGATED METRICS ───────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const role = req.headers['x-saksham-role'] || ROLES.DISTRICT_AUTHORITY;
    const vendorId = req.headers['x-saksham-vendor-id'];
    const district = req.headers['x-saksham-district'];

    let projectQuery = supabase.from('projects').select('*');
    if (role === ROLES.VENDOR && vendorId) {
      projectQuery = projectQuery.eq('vendor_id', vendorId);
    } else if (role === ROLES.DISTRICT_AUTHORITY && district) {
      projectQuery = projectQuery.eq('district', district);
    }

    const { data: projects, error } = await projectQuery;
    if (error) throw error;

    const list = projects || [];
    const totalProjects = list.length;
    let totalSanctioned = 0;
    let totalDisbursed = 0;
    const statusCounts = {};

    list.forEach(p => {
      totalSanctioned += Number(p.sanctioned_amount || 0);
      totalDisbursed += Number(p.released_amount || p.disbursed_amount || p.expenditure_amount || 0);
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    // Active AI flags count
    const { count: activeFlagsCount } = await supabase
      .from('ai_flags')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'RESOLVED');

    const { count: criticalFlagsCount } = await supabase
      .from('ai_flags')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'CRITICAL')
      .neq('status', 'RESOLVED');

    // Vendors count
    const { count: totalVendors } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    // Tenders count
    const { count: totalTenders } = await supabase
      .from('tenders')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      stats: {
        total_projects: totalProjects,
        total_sanctioned: totalSanctioned,
        total_disbursed: totalDisbursed,
        completed_projects: statusCounts['COMPLETED'] || 0,
        stalled_projects: (statusCounts['ON_HOLD'] || 0) + (statusCounts['stalled'] || 0),
        in_progress_projects: (statusCounts['UNDER_IMPLEMENTATION'] || 0) + (statusCounts['IN_PROGRESS'] || 0) + (statusCounts['WORK_IN_PROGRESS'] || 0),
        status_counts: statusCounts,
        active_flags_count: activeFlagsCount || 0,
        critical_flags_count: criticalFlagsCount || 0,
        total_vendors: totalVendors || 0,
        total_tenders: totalTenders || 0,
        last_updated: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(config.port, () => {
  console.log(`[SAKSHAM] Decision-Support API Server active on port ${config.port}`);
  console.log(`[SAKSHAM] Connected to Supabase at: ${config.supabaseUrl}`);
});
