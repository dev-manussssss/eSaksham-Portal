import { ROLES } from '../auth/roles.js';

export const roleNavigation = {
  // ─── DISTRICT AUTHORITY ───────────────────────────────────────────────────
  [ROLES.DISTRICT_AUTHORITY]: [
    { label: 'Dashboard', path: '/district-dashboard', icon: 'dashboard' },
    { label: 'District Works', path: '/projects', icon: 'account_tree' },
    { label: 'Vendor Management', path: '/vendors', icon: 'group' },
    { label: 'Tender Monitoring', path: '/tenders', icon: 'gavel' },
    { label: 'Fund Disbursement', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Work Progress', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Risk & Investigation', path: '/investigations', icon: 'manage_search' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
  ],

  // ─── IMPLEMENTING AGENCY ──────────────────────────────────────────────────
  [ROLES.IMPLEMENTING_AGENCY]: [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid_view' },
    { label: 'Manage Vendors', path: '/vendors', icon: 'group' },
    { label: 'Add Vendor', path: '/vendors/new', icon: 'person_add' },
    { label: 'Manage Tenders', path: '/tenders', icon: 'gavel' },
    { label: 'Projects', path: '/projects', icon: 'account_tree' },
    { label: 'Work Progress', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Fund Disbursement', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Risk & Investigation', path: '/investigations', icon: 'manage_search' },
  ],

  // ─── VENDOR ───────────────────────────────────────────────────────────────
  [ROLES.VENDOR]: [
    { label: 'My Dashboard', path: '/vendor-dashboard', icon: 'space_dashboard' },
    { label: 'My Profile', path: '/vendors/own', icon: 'badge' },
    { label: 'My Tenders', path: '/tenders', icon: 'gavel' },
    { label: 'My Projects', path: '/projects', icon: 'account_tree' },
    { label: 'Work Progress', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Payment Status', path: '/fund-disbursement', icon: 'payments' },
  ],

  // ─── STATE NODAL AUTHORITY ────────────────────────────────────────────────
  [ROLES.STATE_NODAL_AUTHORITY]: [
    { label: 'Dashboard', path: '/state-dashboard', icon: 'dashboard' },
    { label: 'Works & Projects', path: '/projects', icon: 'account_tree' },
    { label: 'Vendor Overview', path: '/vendors', icon: 'group' },
    { label: 'Tender Monitoring', path: '/tenders', icon: 'gavel' },
    { label: 'Fund Utilization', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Progress Monitoring', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Risk & Investigation', path: '/investigations', icon: 'manage_search' },
    { label: 'Fraud Intelligence', path: '/fraud-graph', icon: 'hub' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
  ],

  // ─── CENTRAL NODAL AGENCY ─────────────────────────────────────────────────
  [ROLES.CENTRAL_NODAL_AGENCY]: [
    { label: 'National Dashboard', path: '/national-dashboard', icon: 'public' },
    { label: 'State & District Works', path: '/projects', icon: 'account_tree' },
    { label: 'Vendor Intelligence', path: '/vendors', icon: 'group' },
    { label: 'Tender Intelligence', path: '/tenders', icon: 'gavel' },
    { label: 'Fund Utilization', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Project Monitoring', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Risk & Investigation', path: '/investigations', icon: 'manage_search' },
    { label: 'Fraud Intelligence', path: '/fraud-graph', icon: 'hub' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
  ],

  // ─── MP (MEMBER OF PARLIAMENT) ────────────────────────────────────────────
  [ROLES.MP]: [
    { label: 'Dashboard', path: '/mp-dashboard', icon: 'dashboard' },
    { label: 'Recommended Works', path: '/projects', icon: 'checklist' },
    { label: 'Work Progress', path: '/work-progress', icon: 'published_with_changes' },
    { label: 'Fund Expenditure', path: '/fund-disbursement', icon: 'payments' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
  ],

  // ─── INVESTIGATOR / INSPECTOR ─────────────────────────────────────────────
  [ROLES.INVESTIGATOR]: [
    { label: 'Investigation Dashboard', path: '/investigations', icon: 'policy' },
    { label: 'Vendor Intelligence', path: '/vendors', icon: 'group' },
    { label: 'Tender Intelligence', path: '/tenders', icon: 'gavel' },
    { label: 'Project Verification', path: '/projects', icon: 'architecture' },
    { label: 'Site Progress & Inspection', path: '/work-progress', icon: 'fact_check' },
    { label: 'Fraud Network', path: '/fraud-graph', icon: 'hub' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
  ],
};
