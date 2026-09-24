import { ROLES } from '../auth/roles.js';

/**
 * Authoritative Navigation Architecture for SAKSHAM Prototype
 * 
 * Strictly divides navigation between:
 * 1. e-SAKSHI (MPLADS Works Lifecycle: Recommendation -> Sanction -> IA Assignment -> Implementation -> Inspection -> Completion)
 * 2. e-Procurement (Tendering & Contract Lifecycle: Scope -> Publication -> Bids -> Evaluation -> Comparative View -> Award)
 * 
 * Driven purely by authenticated server role. No client role switching.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. e-SAKSHI PORTAL NAVIGATION (MPLADS Works Lifecycle)
// ─────────────────────────────────────────────────────────────────────────────
export const esakshiNavigation = {
  [ROLES.MP]: [
    { label: 'Constituency Dashboard', path: '/mp-dashboard', icon: 'space_dashboard' },
    { label: 'My Recommendations', path: '/projects', icon: 'playlist_add_check' },
    { label: 'Work Progress', path: '/work-progress', icon: 'timeline' },
    { label: 'Statutory Reports', path: '/reports', icon: 'assessment' },
  ],

  [ROLES.DISTRICT_AUTHORITY]: [
    { label: 'District Dashboard', path: '/district-dashboard', icon: 'space_dashboard' },
    { label: 'Sanction & Works Queue', path: '/projects', icon: 'account_tree' },
    { label: 'Site Inspections', path: '/inspections', icon: 'fact_check' },
    { label: 'Disbursement & MB', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Vigilance & Risk Alerts', path: '/alerts', icon: 'notifications_active' },
    { label: 'Investigation Cases', path: '/investigations', icon: 'manage_search' },
    { label: 'Statutory Reports', path: '/reports', icon: 'assessment' },
    { label: 'Audit Trail', path: '/audit-trail', icon: 'history' },
  ],

  [ROLES.IMPLEMENTING_AGENCY]: [
    { label: 'Agency Dashboard', path: '/dashboard', icon: 'space_dashboard' },
    { label: 'Assigned Works', path: '/projects', icon: 'account_tree' },
    { label: 'Physical Progress & MB', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Site Inspection Requests', path: '/inspections', icon: 'fact_check' },
    { label: 'Fund Disbursement', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Compliance Alerts', path: '/alerts', icon: 'notifications_active' },
    { label: 'Progress Reports', path: '/reports', icon: 'assessment' },
  ],

  [ROLES.VENDOR]: [
    { label: 'Contractor Console', path: '/vendor-dashboard', icon: 'space_dashboard' },
    { label: 'Active Work Orders', path: '/projects', icon: 'account_tree' },
    { label: 'Execution & Measurement', path: '/work-progress', icon: 'construction' },
    { label: 'Milestone Claims & MB', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Corporate Profile', path: '/vendors/own', icon: 'badge' },
  ],

  [ROLES.STATE_NODAL_AUTHORITY]: [
    { label: 'State Overview', path: '/state-dashboard', icon: 'space_dashboard' },
    { label: 'Statewide Works', path: '/projects', icon: 'account_tree' },
    { label: 'District Scrutiny', path: '/district-dashboard', icon: 'location_city' },
    { label: 'Risk Intelligence', path: '/investigations', icon: 'manage_search' },
    { label: 'Fraud Graph', path: '/fraud-graph', icon: 'hub' },
    { label: 'Statutory Reports', path: '/reports', icon: 'assessment' },
    { label: 'Audit Trail', path: '/audit-trail', icon: 'history' },
  ],

  [ROLES.CENTRAL_NODAL_AGENCY]: [
    { label: 'National Dashboard', path: '/national-dashboard', icon: 'public' },
    { label: 'National Portfolio', path: '/projects', icon: 'account_tree' },
    { label: 'State Allocations', path: '/state-dashboard', icon: 'map' },
    { label: 'National Risk Registry', path: '/investigations', icon: 'manage_search' },
    { label: 'Audit Trail', path: '/audit-trail', icon: 'history' },
    { label: 'Statutory Reports', path: '/reports', icon: 'assessment' },
  ],

  [ROLES.INVESTIGATOR]: [
    { label: 'Investigation Dashboard', path: '/investigations', icon: 'policy' },
    { label: 'Works Audit Portfolio', path: '/projects', icon: 'account_tree' },
    { label: 'Risk Signals & Alerts', path: '/alerts', icon: 'crisis_alert' },
    { label: 'Inspection Evidence', path: '/inspections', icon: 'fact_check' },
    { label: 'Entity Relationship Graph', path: '/fraud-graph', icon: 'hub' },
    { label: 'Immutable Audit Trail', path: '/audit-trail', icon: 'history' },
    { label: 'Statutory Reports', path: '/reports', icon: 'assessment' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. e-PROCUREMENT PORTAL NAVIGATION (Tendering & Contracting Lifecycle)
// ─────────────────────────────────────────────────────────────────────────────
export const eprocurementNavigation = {
  // District Authority / Procurement Admin
  [ROLES.DISTRICT_AUTHORITY]: [
    { label: 'Procurement Dashboard', path: '/procurement-dashboard', icon: 'dashboard_customize' },
    { label: 'Tenders Master Register', path: '/tenders', icon: 'gavel' },
    { label: 'Registered Contractors', path: '/vendors', icon: 'storefront' },
    { label: 'Bid Evaluations & Awards', path: '/tenders?tab=evaluations', icon: 'rule' },
    { label: 'Contractor Risk Scores', path: '/vendors?tab=risk', icon: 'verified_user' },
    { label: 'Procurement Audit Trail', path: '/audit-trail', icon: 'history' },
  ],

  // Implementing Agency / Technical User
  [ROLES.IMPLEMENTING_AGENCY]: [
    { label: 'Tender Management', path: '/tenders', icon: 'gavel' },
    { label: 'Assigned Procurements', path: '/procurement-dashboard', icon: 'assignment' },
    { label: 'Technical Bid Evaluation', path: '/tenders?tab=evaluations', icon: 'fact_check' },
    { label: 'Contractors Directory', path: '/vendors', icon: 'group' },
    { label: 'Comparative Statements', path: '/tenders', icon: 'table_view' },
  ],

  // Vendor / Bidder
  [ROLES.VENDOR]: [
    { label: 'Open Opportunities', path: '/tenders', icon: 'campaign' },
    { label: 'My Submitted Bids', path: '/tenders?tab=my_bids', icon: 'assignment_turned_in' },
    { label: 'Awarded Contracts', path: '/projects', icon: 'handshake' },
    { label: 'Corporate Compliance', path: '/vendors/own', icon: 'verified' },
  ],

  // Investigator / Vigilance
  [ROLES.INVESTIGATOR]: [
    { label: 'Procurement Intelligence', path: '/procurement-dashboard', icon: 'manage_search' },
    { label: 'Tender Irregularities', path: '/tenders', icon: 'gavel' },
    { label: 'Collusion & Cartel Graph', path: '/fraud-graph', icon: 'hub' },
    { label: 'High-Risk Bidders', path: '/vendors', icon: 'group' },
    { label: 'Procurement Audit Trail', path: '/audit-trail', icon: 'history' },
  ],

  // State & Central oversight
  [ROLES.STATE_NODAL_AUTHORITY]: [
    { label: 'Statewide Procurement', path: '/procurement-dashboard', icon: 'dashboard_customize' },
    { label: 'State Tenders', path: '/tenders', icon: 'gavel' },
    { label: 'Contractors Directory', path: '/vendors', icon: 'storefront' },
    { label: 'Cartel Detection Graph', path: '/fraud-graph', icon: 'hub' },
    { label: 'Audit Trail', path: '/audit-trail', icon: 'history' },
  ],

  [ROLES.CENTRAL_NODAL_AGENCY]: [
    { label: 'National Procurement', path: '/procurement-dashboard', icon: 'dashboard_customize' },
    { label: 'National Tenders Registry', path: '/tenders', icon: 'gavel' },
    { label: 'National Vendor Registry', path: '/vendors', icon: 'storefront' },
    { label: 'Cartel Detection Graph', path: '/fraud-graph', icon: 'hub' },
    { label: 'Audit Trail', path: '/audit-trail', icon: 'history' },
  ],

  // MP: No administrative procurement controls per Section 6
  [ROLES.MP]: [
    { label: 'Procurement Status (Read-Only)', path: '/tenders', icon: 'visibility' },
    { label: 'Return to e-SAKSHI Works', path: '/mp-dashboard', icon: 'arrow_back' },
  ],
};

// Fallback legacy export
export const roleNavigation = esakshiNavigation;
