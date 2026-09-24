/**
 * SAKSHAM AI Risk Taxonomy (AUD-023)
 * Controlled vocabulary for all automated and model-assisted risk flags.
 */
export const RISK_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const RISK_CATEGORIES = {
  COLLUSION: 'COLLUSION',
  FINANCIAL: 'FINANCIAL',
  TIMELINE: 'TIMELINE',
  QUALITY: 'QUALITY',
  DOCUMENT: 'DOCUMENT',
  GEOSPATIAL: 'GEOSPATIAL',
};

export const ALLOWED_FLAG_CODES = [
  'MB_EXCEEDS_BOQ',
  'FINANCIAL_AHEAD_OF_PHYSICAL',
  'DUPLICATE_MEASUREMENT_CLAIM',
  'UNVERIFIED_CADASTRAL_COORDINATES',
  'SOLE_BIDDER_PERSISTENCE',
  'BID_DISCOUNT_ANOMALY',
  'INVOICE_TOTAL_MISMATCH',
  'UNAPPROVED_SPECIFICATION_CHANGE',
  'STALLED_MILESTONE_PROGRESS',
  'GEO_SPOOFING_DETECTED',
  'SHELL_INDICATOR_UNCONFIRMED',
  'GENERAL_INSPECTION_DEFICIENCY',
];

export function validateFlag(flag) {
  if (!flag || typeof flag !== 'object') return null;
  const flag_code = ALLOWED_FLAG_CODES.includes(flag.flag_code)
    ? flag.flag_code
    : 'GENERAL_INSPECTION_DEFICIENCY';

  const severity = [RISK_SEVERITY.LOW, RISK_SEVERITY.MEDIUM, RISK_SEVERITY.HIGH, RISK_SEVERITY.CRITICAL].includes(flag.severity)
    ? flag.severity
    : RISK_SEVERITY.MEDIUM;

  return {
    flag_code,
    severity,
    title: String(flag.title || 'Risk Signal Detected').slice(0, 255),
    explanation: String(flag.explanation || 'Observation recorded during automated analysis.').slice(0, 2000),
    recommended_action: String(flag.recommended_action || 'REQUEST_VERIFICATION').slice(0, 64),
    primary_evidence: flag.primary_evidence || {},
  };
}
