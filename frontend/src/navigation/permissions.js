import { ROLES } from '../auth/roles.js';

export const routePermissions = {
  // Vendor operational creation & editing (DA + IA)
  '/vendors/new': [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY],
  '/vendors/:id/edit': [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY],

  // Vendor registry access
  '/vendors': [
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.DISTRICT_AUTHORITY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.INVESTIGATOR,
  ],

  // Dashboards
  '/dashboard': [ROLES.IMPLEMENTING_AGENCY, ROLES.DISTRICT_AUTHORITY],
  '/district-dashboard': [ROLES.DISTRICT_AUTHORITY, ROLES.STATE_NODAL_AUTHORITY, ROLES.CENTRAL_NODAL_AGENCY],
  '/state-dashboard': [ROLES.STATE_NODAL_AUTHORITY, ROLES.CENTRAL_NODAL_AGENCY],
  '/national-dashboard': [ROLES.CENTRAL_NODAL_AGENCY],
  '/mp-dashboard': [ROLES.MP, ROLES.DISTRICT_AUTHORITY],
  '/vendor-dashboard': [ROLES.VENDOR],

  // Investigations
  '/investigations': [
    ROLES.INVESTIGATOR,
    ROLES.DISTRICT_AUTHORITY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.IMPLEMENTING_AGENCY,
  ],

  // Tenders & Procurement
  '/procurement-dashboard': [
    ROLES.DISTRICT_AUTHORITY,
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.INVESTIGATOR,
    ROLES.VENDOR,
  ],
  '/tenders': [
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.DISTRICT_AUTHORITY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.INVESTIGATOR,
    ROLES.VENDOR,
    ROLES.MP,
  ],

  // Works / Projects
  '/projects': [
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.DISTRICT_AUTHORITY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.INVESTIGATOR,
    ROLES.VENDOR,
    ROLES.MP,
  ],

  // Fund Disbursement
  '/fund-disbursement': [
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.DISTRICT_AUTHORITY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.VENDOR,
    ROLES.MP,
  ],

  // Work Progress
  '/work-progress': [
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.DISTRICT_AUTHORITY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.INVESTIGATOR,
    ROLES.VENDOR,
    ROLES.MP,
  ],

  // Fraud Graph Intelligence
  '/fraud-graph': [
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.INVESTIGATOR,
  ],

  // Statutory Reports
  '/reports': [
    ROLES.DISTRICT_AUTHORITY,
    ROLES.IMPLEMENTING_AGENCY,
    ROLES.STATE_NODAL_AUTHORITY,
    ROLES.CENTRAL_NODAL_AGENCY,
    ROLES.MP,
    ROLES.INVESTIGATOR,
  ],
};

export function isRouteAllowed(role, pathname) {
  // Normalize path without query params or trailing slash
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

  // Check exact match first
  if (routePermissions[cleanPath]) {
    return routePermissions[cleanPath].includes(role);
  }

  // Check dynamic paths like /vendors/:id or /tenders/:id or /projects/:id
  if (cleanPath.startsWith('/vendors/')) {
    if (cleanPath === '/vendors/new') {
      return routePermissions['/vendors/new'].includes(role);
    }
    if (cleanPath.endsWith('/edit')) {
      return [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY].includes(role);
    }
    // Any profile view is allowed for oversight and vendor themselves
    return true;
  }
  if (cleanPath.startsWith('/tenders/')) {
    return routePermissions['/tenders'].includes(role);
  }
  if (cleanPath.startsWith('/projects/')) {
    return routePermissions['/projects'].includes(role);
  }

  // By default allow general routes unless restricted
  return true;
}
