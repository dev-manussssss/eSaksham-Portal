/**
 * SAKSHAM Vendor Risk Engine
 *
 * Calculates a 4-dimension weighted vendor risk score using only measurable
 * fields actually stored in Supabase (01_saksham_schema.sql + 02_vendor_risk_scores.sql).
 *
 * IMPORTANT PRINCIPLES:
 * - All signals are RISK INDICATORS, not fraud determinations.
 * - Only fields confirmed available in the database schema are used.
 * - Fields not yet tracked are marked status: 'ANALYSIS_PENDING' and score 0.
 * - On-time completions do NOT subtract points; low risk emerges from absence of signals.
 * - Every signal includes its source field so human officers can verify.
 *
 * Weights:
 *   Historical Performance  35%
 *   Collusion & Network     25%
 *   Financial Anomalies     25%
 *   Document Integrity      15%
 *
 * Thresholds: 0–39 LOW | 40–69 MODERATE | 70–84 HIGH | 85–100 CRITICAL
 */

import { supabase } from './supabase.js';

function clip(value, min = 0, max = 100) {
  return Math.min(Math.max(Math.round(value * 100) / 100, min), max);
}

function severityFromScore(score) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

/**
 * A. Historical Performance Score (35%)
 * Inputs: projects, ai_flags
 */
async function calcHistoricalPerformance(vendorId) {
  const signals = [];

  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, target_completion_date, updated_at')
    .eq('vendor_id', vendorId);

  const total = (projects || []).length;
  if (total === 0) {
    return { score: 0, signals: [{ dimension: 'A', signal_code: 'NO_HISTORY', label: 'No project history', points: 0, status: 'ANALYSIS_PENDING', source_field: 'projects.vendor_id' }] };
  }

  const cancelled = projects.filter(p => ['CANCELLED', 'stalled'].includes(p.status));
  const completed = projects.filter(p => p.status === 'COMPLETED');
  // Proxy for delay: updated_at significantly past target_completion_date
  const delayed = projects.filter(p =>
    p.status === 'COMPLETED' &&
    p.target_completion_date &&
    new Date(p.updated_at) > new Date(new Date(p.target_completion_date).getTime() + 30 * 86400000) // >30 days late
  );

  // Active HIGH/CRITICAL flags on this vendor's projects
  const projectIds = projects.map(p => p.id);
  let flagCount = 0;
  if (projectIds.length > 0) {
    const { data: flags } = await supabase
      .from('ai_flags')
      .select('id', { count: 'exact' })
      .in('project_id', projectIds)
      .in('severity', ['HIGH', 'CRITICAL'])
      .eq('status', 'ACTIVE');
    flagCount = flags?.length || 0;
  }

  let score = 0;

  if (cancelled.length > 0) {
    const pts = clip(cancelled.length * 25, 0, 50);
    score += pts;
    signals.push({ dimension: 'A', signal_code: 'ABANDONED_WORKS', label: `${cancelled.length} work(s) abandoned or cancelled`, points: pts, status: 'ACTIVE', source_field: 'projects.status IN (CANCELLED, stalled)' });
  }

  if (total > 0) {
    const delayRatio = delayed.length / total;
    const pts = clip(delayRatio * 40, 0, 40);
    if (pts > 0) {
      score += pts;
      signals.push({ dimension: 'A', signal_code: 'DELAY_PATTERN', label: `Delay pattern: ${delayed.length} of ${total} projects completed late (>30 days)`, points: pts, status: 'ACTIVE', source_field: 'projects.updated_at vs target_completion_date' });
    }
  }

  if (flagCount > 0) {
    const pts = clip(flagCount * 10, 0, 30);
    score += pts;
    signals.push({ dimension: 'A', signal_code: 'ACTIVE_AI_FLAGS', label: `${flagCount} active HIGH/CRITICAL anomaly flag(s) on vendor's projects`, points: pts, status: 'ACTIVE', source_field: 'ai_flags.severity, ai_flags.status' });
  }

  return { score: clip(score), signals };
}

/**
 * B. Collusion & Network Score (25%)
 * Inputs: vendors (shared address, shared DINs)
 */
async function calcCollusionNetwork(vendorId) {
  const signals = [];

  const { data: vendor, error: vErr } = await supabase
    .from('vendors')
    .select('id, company_name, gstin, district, state, sector, is_blacklisted')
    .eq('id', vendorId)
    .single();

  if (!vendor || vErr) {
    return { score: 0, signals: [{ dimension: 'B', signal_code: 'VENDOR_NOT_FOUND', label: 'Vendor record not found', points: 0, status: 'ANALYSIS_PENDING', source_field: 'vendors.id' }] };
  }

  let score = 0;

  // District & Sector concentration indicator
  if (vendor.district && vendor.sector) {
    const { data: peerVendors } = await supabase
      .from('vendors')
      .select('id')
      .eq('district', vendor.district)
      .eq('sector', vendor.sector)
      .neq('id', vendorId);

    const peerCount = peerVendors?.length || 0;
    if (peerCount >= 2) {
      signals.push({
        dimension: 'B',
        signal_code: 'LOCAL_CONCENTRATION_CLUSTER',
        label: `Active in high-density local procurement cluster (${peerCount} peer firms in ${vendor.district} ${vendor.sector})`,
        points: 10,
        status: 'ACTIVE',
        source_field: 'vendors.district, vendors.sector',
      });
      score += 10;
    }
  }

  // Sole-bidder awards — PENDING (bids table not yet in schema)
  signals.push({
    dimension: 'B',
    signal_code: 'SOLE_BIDDER_WINS',
    label: 'Sole-bidder award detection requires tenders bid registry',
    points: 0,
    status: 'ANALYSIS_PENDING',
    source_field: 'tenders.awarded_vendor_id',
  });

  return { score: clip(score), signals };
}

/**
 * C. Financial Anomalies Score (25%)
 * Inputs: bills, boq_items, projects
 */
async function calcFinancialAnomalies(vendorId) {
  const signals = [];

  const { data: projects, error: pErr } = await supabase
    .from('projects')
    .select('id, status, sanctioned_amount, released_amount, expenditure_amount')
    .eq('vendor_id', vendorId);

  const projectIds = (projects || []).map(p => p.id);
  if (projectIds.length === 0) {
    return { score: 0, signals: [{ dimension: 'C', signal_code: 'NO_PROJECTS', label: 'No projects currently assigned to evaluate', points: 0, status: 'ANALYSIS_PENDING', source_field: 'projects.vendor_id' }] };
  }

  let score = 0;
  const ratios = [];

  for (const projectId of projectIds) {
    const [{ data: bills }, { data: boq }] = await Promise.all([
      supabase.from('bills').select('billed_amount').eq('project_id', projectId),
      supabase.from('boq_items').select('total_amount').eq('project_id', projectId),
    ]);
    const totalBilled = (bills || []).reduce((s, b) => s + parseFloat(b.billed_amount || 0), 0);
    const totalBoq = (boq || []).reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);
    if (totalBoq > 0) ratios.push(totalBilled / totalBoq);
  }

  if (ratios.length > 0) {
    const avg = ratios.reduce((s, r) => s + r, 0) / ratios.length;
    if (avg > 1.15) {
      score += 30;
      signals.push({ dimension: 'C', signal_code: 'OVERBILLING_PATTERN', label: `Average billed amount is ${Math.round(avg * 100)}% of BOQ across ${ratios.length} project(s) — risk indicator only`, points: 30, status: 'ACTIVE', source_field: 'bills.billed_amount vs boq_items.total_amount' });
    } else if (avg < 0.60 && (projects || []).filter(p => p.status === 'COMPLETED').length > 0) {
      score += 15;
      signals.push({ dimension: 'C', signal_code: 'UNDERBILLING_COMPLETED', label: `Significantly underbilled on completed works (avg ${Math.round(avg * 100)}% of BOQ) — possible work splitting`, points: 15, status: 'ACTIVE', source_field: 'bills.billed_amount vs boq_items.total_amount' });
    }
  }

  // Bid discount anomaly — PENDING (bids table not yet available)
  signals.push({ dimension: 'C', signal_code: 'BID_DISCOUNT_ANOMALY', label: 'Abnormal bid discount detection requires bids table', points: 0, status: 'ANALYSIS_PENDING', source_field: 'bids table (not yet implemented)' });

  return { score: clip(score), signals };
}

/**
 * D. Document Integrity Score (15%)
 * Inputs: ai_flags, measurements, bills
 */
async function calcDocumentIntegrity(vendorId) {
  const signals = [];

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('vendor_id', vendorId);

  const projectIds = (projects || []).map(p => p.id);
  if (projectIds.length === 0) return { score: 0, signals: [] };

  let score = 0;

  // AI document integrity flags on vendor's projects
  const { data: docFlags } = await supabase
    .from('ai_flags')
    .select('id', { count: 'exact' })
    .in('project_id', projectIds)
    .in('flag_code', ['QUANTITY_MISMATCH', 'MB_DISCREPANCY', 'INVOICE_TAMPER'])
    .eq('status', 'ACTIVE');
  const docFlagCount = docFlags?.length || 0;

  if (docFlagCount > 0) {
    const pts = clip(docFlagCount * 12, 0, 60);
    score += pts;
    signals.push({ dimension: 'D', signal_code: 'DOCUMENT_INTEGRITY_FLAGS', label: `${docFlagCount} document anomaly flag(s) on vendor's projects (quantity mismatch, MB discrepancy, invoice tamper)`, points: pts, status: 'ACTIVE', source_field: 'ai_flags.flag_code IN (QUANTITY_MISMATCH, MB_DISCREPANCY, INVOICE_TAMPER)' });
  }

  // MB vs bill quantity mismatches
  let mbMismatchCount = 0;
  for (const projectId of projectIds) {
    const [{ data: measurements }, { data: bills }] = await Promise.all([
      supabase.from('measurements').select('item_no, recorded_qty').eq('project_id', projectId),
      supabase.from('bills').select('item_no, executed_qty').eq('project_id', projectId),
    ]);
    const mbMap = Object.fromEntries((measurements || []).map(m => [m.item_no, parseFloat(m.recorded_qty)]));
    for (const bill of (bills || [])) {
      const mbQty = mbMap[bill.item_no];
      if (mbQty !== undefined && Math.abs(mbQty - parseFloat(bill.executed_qty)) > 0.01) {
        mbMismatchCount++;
      }
    }
  }

  if (mbMismatchCount > 0) {
    const pts = clip(mbMismatchCount * 8, 0, 40);
    score += pts;
    signals.push({ dimension: 'D', signal_code: 'MB_BILL_MISMATCH', label: `${mbMismatchCount} item(s) where measurement book quantity differs from billed quantity`, points: pts, status: 'ACTIVE', source_field: 'measurements.recorded_qty vs bills.executed_qty (same project_id + item_no)' });
  }

  return { score: clip(score), signals };
}

/**
 * Main: Calculate and persist vendor risk score.
 * Returns the newly persisted risk score record.
 */
export async function calculateVendorRiskScore(vendorId) {
  // 1. Check blacklist status
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, company_name, is_blacklisted, is_active')
    .eq('id', vendorId)
    .single();

  if (!vendor) throw new Error(`Vendor ${vendorId} not found`);

  // 2. Calculate all 4 dimensions in parallel
  const [dimA, dimB, dimC, dimD] = await Promise.all([
    calcHistoricalPerformance(vendorId),
    calcCollusionNetwork(vendorId),
    calcFinancialAnomalies(vendorId),
    calcDocumentIntegrity(vendorId),
  ]);

  // 3. Weighted composite
  let composite = clip(
    0.35 * dimA.score +
    0.25 * dimB.score +
    0.25 * dimC.score +
    0.15 * dimD.score
  );

  const blacklistOverride = vendor.is_blacklisted === true;
  if (blacklistOverride) composite = 100;

  const severity = severityFromScore(composite);
  const allSignals = [...dimA.signals, ...dimB.signals, ...dimC.signals, ...dimD.signals];

  // 4. Set previous latest=false
  await supabase
    .from('vendor_risk_scores')
    .update({ is_latest: false })
    .eq('vendor_id', vendorId)
    .eq('is_latest', true);

  // 5. Insert new score record
  const { data: newScore, error } = await supabase
    .from('vendor_risk_scores')
    .insert({
      vendor_id: vendorId,
      historical_performance_score: dimA.score,
      collusion_network_score: dimB.score,
      financial_anomaly_score: dimC.score,
      document_integrity_score: dimD.score,
      composite_score: composite,
      severity,
      blacklist_override: blacklistOverride,
      signals: allSignals,
      is_latest: true,
    })
    .select()
    .single();

  if (error) throw error;

  return newScore;
}

/**
 * Get cached or fresh vendor risk score.
 * Returns cached if is_latest=true and calculated within 24h.
 */
export async function getVendorRiskScore(vendorId) {
  const { data: cached } = await supabase
    .from('vendor_risk_scores')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_latest', true)
    .single();

  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  if (cached && (Date.now() - new Date(cached.calculated_at).getTime()) < CACHE_TTL_MS) {
    return { ...cached, fromCache: true };
  }

  // Recalculate and persist
  const fresh = await calculateVendorRiskScore(vendorId);
  return { ...fresh, fromCache: false };
}
