/**
 * SAKSHAM Input Validation & Field Allowlists (AUD-009)
 * Prevents arbitrary field tampering, privilege escalation, and blacklisting bypass.
 */

// Permitted fields for vendor profile update by authorized editors
const ALLOWED_VENDOR_PROFILE_FIELDS = [
  'company_name',
  'gstin',
  'pan',
  'state',
  'district',
  'sector',
];

export function validateVendorUpdate(req, res, next) {
  const incoming = req.body || {};
  const sanitized = {};

  // Reject attempts by non-administrators to self-edit administrative risk or blacklisting
  const forbiddenFields = [
    'is_blacklisted',
    'risk_level',
    'risk_score',
    'longitudinal_risk_score',
    'id',
    'created_at',
  ];

  const attemptedForbidden = forbiddenFields.filter(f => Object.prototype.hasOwnProperty.call(incoming, f));
  if (attemptedForbidden.length > 0) {
    return res.status(403).json({
      success: false,
      error: `Security violation: Modifying protected administrative field(s) [${attemptedForbidden.join(', ')}] is restricted to formal statutory proceedings.`,
    });
  }

  for (const field of ALLOWED_VENDOR_PROFILE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(incoming, field) && incoming[field] !== undefined) {
      sanitized[field] = incoming[field];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid updatable vendor profile fields provided.',
    });
  }

  req.sanitizedVendorUpdate = sanitized;
  next();
}
