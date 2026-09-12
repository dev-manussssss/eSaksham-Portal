/**
 * SAKSHAM Data Index — Central re-export and helper functions.
 * Source: Aggregated from docs/MOCK DATA/Vendors.md and Tenders.md
 *
 * All statistics are computed from the mock datasets, not invented.
 */

// ─── Mock data re-exports ──────────────────────────────────────────────────
export { vendors, vendorNetworkSignals, getVendorById } from './mock/vendors.js';
export { tenders, tenderRiskMatrix, getTenderById } from './mock/tenders.js';
export { projects, getProjectById, getProjectsByVendor, getProjectsByTender } from './mock/projects.js';
export { investigations, getInvestigationById, getInvestigationsByVendor } from './mock/investigations.js';
export { payments, getPaymentsByProject, getPaymentsByVendor } from './mock/payments.js';

// ─── Risk config helpers ───────────────────────────────────────────────────
export const getRiskConfig = (level) => {
  const configs = {
    LOW: {
      label: 'LOW',
      bgClass: 'bg-status-success-bg',
      textClass: 'text-status-success-text',
      dotClass: 'bg-status-success-dot',
      borderClass: 'border-green-200',
      hex: '#059669',
    },
    MEDIUM: {
      label: 'MEDIUM',
      bgClass: 'bg-status-warning-bg',
      textClass: 'text-status-warning-text',
      dotClass: 'bg-status-warning-dot',
      borderClass: 'border-amber-200',
      hex: '#D97706',
    },
    HIGH: {
      label: 'HIGH',
      bgClass: 'bg-status-danger-bg',
      textClass: 'text-status-danger-text',
      dotClass: 'bg-status-danger-dot',
      borderClass: 'border-red-200',
      hex: '#DC2626',
    },
    CRITICAL: {
      label: 'CRITICAL',
      bgClass: 'bg-[#450a0a]',
      textClass: 'text-[#fecaca]',
      dotClass: 'bg-[#fecaca]',
      borderClass: 'border-red-900',
      hex: '#7f1d1d',
    },
  };
  return configs[level] || configs.MEDIUM;
};

export const getStatusConfig = (status) => {
  const configs = {
    active: { label: 'Active', bgClass: 'bg-status-success-bg', textClass: 'text-status-success-text', dotClass: 'bg-status-success-dot' },
    completed: { label: 'Completed', bgClass: 'bg-status-success-bg', textClass: 'text-status-success-text', dotClass: 'bg-status-success-dot' },
    in_progress: { label: 'In Progress', bgClass: 'bg-status-info-bg', textClass: 'text-status-info-text', dotClass: 'bg-status-info-dot' },
    under_inspection: { label: 'Under Inspection', bgClass: 'bg-status-warning-bg', textClass: 'text-status-warning-text', dotClass: 'bg-status-warning-dot' },
    under_review: { label: 'Under Review', bgClass: 'bg-status-warning-bg', textClass: 'text-status-warning-text', dotClass: 'bg-status-warning-dot' },
    tendering: { label: 'Tendering', bgClass: 'bg-status-warning-bg', textClass: 'text-status-warning-text', dotClass: 'bg-status-warning-dot' },
    suspended: { label: 'Suspended', bgClass: 'bg-status-danger-bg', textClass: 'text-status-danger-text', dotClass: 'bg-status-danger-dot' },
    pending_review: { label: 'Pending Review', bgClass: 'bg-status-warning-bg', textClass: 'text-status-warning-text', dotClass: 'bg-status-warning-dot' },
    released: { label: 'Released', bgClass: 'bg-status-success-bg', textClass: 'text-status-success-text', dotClass: 'bg-status-success-dot' },
    stalled: { label: 'Stalled', bgClass: 'bg-status-danger-bg', textClass: 'text-status-danger-text', dotClass: 'bg-status-danger-dot' },
    asset_handover: { label: 'Asset Handover', bgClass: 'bg-status-success-bg', textClass: 'text-status-success-text', dotClass: 'bg-status-success-dot' },
    'Financial Evaluation Completed': { label: 'Fin. Eval. Complete', bgClass: 'bg-status-info-bg', textClass: 'text-status-info-text', dotClass: 'bg-status-info-dot' },
    'Technical Evaluation': { label: 'Tech. Evaluation', bgClass: 'bg-status-warning-bg', textClass: 'text-status-warning-text', dotClass: 'bg-status-warning-dot' },
    'Awarded': { label: 'Awarded', bgClass: 'bg-status-success-bg', textClass: 'text-status-success-text', dotClass: 'bg-status-success-dot' },
    'Bids Under Evaluation': { label: 'Under Evaluation', bgClass: 'bg-status-warning-bg', textClass: 'text-status-warning-text', dotClass: 'bg-status-warning-dot' },
    'Financial Evaluation': { label: 'Fin. Evaluation', bgClass: 'bg-status-info-bg', textClass: 'text-status-info-text', dotClass: 'bg-status-info-dot' },
  };
  return configs[status] || { label: status, bgClass: 'bg-surface-subtle', textClass: 'text-text-secondary', dotClass: 'bg-text-muted' };
};
