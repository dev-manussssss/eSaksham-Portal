/**
 * SAKSHAM Backend RBAC — Role-Based Access Control
 *
 * DEMO-ONLY AUTH NOTICE:
 * Roles are passed via x-saksham-role header from the frontend (demo mode).
 * This is NOT secure production authentication.
 * For production: validate a Supabase Auth JWT and extract role from token claims.
 * Replacing auth = update the middleware that reads the role header → no changes needed here.
 */

export const ROLES = {
  MP: 'MP',
  DISTRICT_AUTHORITY: 'DISTRICT_AUTHORITY',
  IMPLEMENTING_AGENCY: 'IMPLEMENTING_AGENCY',
  VENDOR: 'VENDOR',
  INVESTIGATOR: 'INVESTIGATOR',
  STATE_NODAL_AUTHORITY: 'STATE_NODAL_AUTHORITY',
  CENTRAL_NODAL_AGENCY: 'CENTRAL_NODAL_AGENCY',
};

export const PERMISSIONS = {
  // Document Uploads
  UPLOAD_RECOMMENDATION: [ROLES.MP, ROLES.DISTRICT_AUTHORITY],
  UPLOAD_WORK_DOCUMENTS: [ROLES.IMPLEMENTING_AGENCY, ROLES.DISTRICT_AUTHORITY],
  UPLOAD_BILL_INVOICE: [ROLES.VENDOR, ROLES.IMPLEMENTING_AGENCY],
  UPLOAD_EVIDENCE: [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY, ROLES.VENDOR, ROLES.INVESTIGATOR],

  // Decisions / Human Actions (project-level)
  PUT_ON_HOLD: [ROLES.DISTRICT_AUTHORITY],
  CLEAR_HOLD: [ROLES.DISTRICT_AUTHORITY],
  REQUEST_VERIFICATION: [ROLES.DISTRICT_AUTHORITY, ROLES.INVESTIGATOR],
  REQUEST_CLARIFICATION: [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY],
  SUBMIT_FOR_INSPECTION: [ROLES.IMPLEMENTING_AGENCY],
  MARK_VERIFIED: [ROLES.DISTRICT_AUTHORITY],
  APPROVE: [ROLES.DISTRICT_AUTHORITY],
  REJECT: [ROLES.DISTRICT_AUTHORITY],
  ESCALATE: [ROLES.DISTRICT_AUTHORITY, ROLES.INVESTIGATOR],
  ADD_AUDIT_NOTE: [ROLES.INVESTIGATOR, ROLES.DISTRICT_AUTHORITY],

  // Auditing & Visibility
  // VENDOR must NOT appear here — enforced at backend and hidden in frontend
  VIEW_FULL_AUDIT: [ROLES.DISTRICT_AUTHORITY, ROLES.INVESTIGATOR, ROLES.STATE_NODAL_AUTHORITY, ROLES.CENTRAL_NODAL_AGENCY],

  // Vendor Management
  // District Authority and Implementing Agency can create/edit vendors
  CREATE_VENDOR: [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY],
  EDIT_VENDOR: [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY],
  // Only District Authority may deactivate (soft-only — never hard-delete)
  DEACTIVATE_VENDOR: [ROLES.DISTRICT_AUTHORITY],
  VIEW_VENDOR_RISK: [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY, ROLES.STATE_NODAL_AUTHORITY, ROLES.CENTRAL_NODAL_AGENCY, ROLES.INVESTIGATOR],

  // Tender Management
  CREATE_TENDER: [ROLES.IMPLEMENTING_AGENCY],

  // Investigation Management
  OPEN_INVESTIGATION: [ROLES.DISTRICT_AUTHORITY, ROLES.INVESTIGATOR],
  UPDATE_INVESTIGATION: [ROLES.DISTRICT_AUTHORITY, ROLES.INVESTIGATOR],
};

export function canPerformAction(role, action) {
  if (!role || !action) return false;
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

export function filterProjectsForRole(projects, role, userMetadata = {}) {
  if (!Array.isArray(projects)) return [];
  if (role === ROLES.DISTRICT_AUTHORITY) {
    return userMetadata.district
      ? projects.filter(p => p.district?.toLowerCase() === userMetadata.district.toLowerCase())
      : projects;
  }
  if (role === ROLES.MP) {
    return userMetadata.constituency
      ? projects.filter(p => p.constituency?.toLowerCase().includes(userMetadata.constituency.toLowerCase().split(' ')[0]))
      : projects;
  }
  if (role === ROLES.VENDOR) {
    // Vendor sees only their own projects
    return userMetadata.vendorId
      ? projects.filter(p => p.vendor_id === userMetadata.vendorId)
      : [];
  }
  if (role === ROLES.IMPLEMENTING_AGENCY) {
    return userMetadata.district
      ? projects.filter(p => p.district?.toLowerCase() === userMetadata.district.toLowerCase())
      : projects;
  }
  // Investigator / State / Central see all
  return projects;
}

export function filterVendorsForRole(vendors, role, userMetadata = {}) {
  if (!Array.isArray(vendors)) return [];
  // Vendor role can only see their own profile — enforced at route level; this is a safety guard
  if (role === ROLES.VENDOR) {
    return userMetadata.vendorId
      ? vendors.filter(v => v.id === userMetadata.vendorId)
      : [];
  }
  // DA / IA scoped to their district's vendors (where district field available)
  if ((role === ROLES.DISTRICT_AUTHORITY || role === ROLES.IMPLEMENTING_AGENCY) && userMetadata.district) {
    return vendors.filter(v =>
      !v.district || v.district.toLowerCase() === userMetadata.district.toLowerCase()
    );
  }
  // Investigator / State / Central see all active + inactive
  return vendors;
}

export function filterTendersForRole(tenders, role, userMetadata = {}) {
  if (!Array.isArray(tenders)) return [];
  if (role === ROLES.VENDOR) {
    // Vendor sees only tenders where they were awarded vendor
    return userMetadata.vendorId
      ? tenders.filter(t => t.awarded_vendor_id === userMetadata.vendorId)
      : [];
  }
  if ((role === ROLES.DISTRICT_AUTHORITY || role === ROLES.IMPLEMENTING_AGENCY) && userMetadata.district) {
    return tenders.filter(t =>
      !t.district || t.district.toLowerCase() === userMetadata.district.toLowerCase()
    );
  }
  return tenders;
}
