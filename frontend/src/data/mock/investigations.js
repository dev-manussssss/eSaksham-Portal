/**
 * SAKSHAM Mock Investigations Dataset
 * Source: Derived from docs/MOCK DATA/Vendors.md
 *
 * SYNTHETIC DEMONSTRATION DATA ONLY.
 *
 * Investigation demonstrations:
 * - VND-007 (CRITICAL): High-severity investigation
 *   Vendor → Tender → Project → Inspection → Documents → Risk Signals → Evidence
 * - VND-003 + VND-009: Network-oriented demonstration
 *
 * IMPORTANT: Network signals are indicators requiring review, not proof of collusion.
 * Do NOT display "Fraud Confirmed" — these are signals requiring human review.
 */

export const investigations = [
  // ─── INV-001: VND-007 High-Severity Investigation ─────────────────────────
  {
    id: 'INV-001',
    referenceNo: 'SAKSHAM/INV/WB/NAD/2026-27/001',
    title: 'Quantity Reconciliation & Inspection Discrepancy — VND-007',
    status: 'active',
    severity: 'CRITICAL',
    compositeScore: 83,
    vendorId: 'VND-007',
    tenderId: 'TND-004',
    projectId: 'PRJ-007',
    initiatedDate: '2026-08-22',
    lastUpdated: '2026-09-10',
    assignedOfficer: 'Nodal Officer (Demo District)',
    investigationChain: {
      vendor: 'VND-007',
      tender: 'TND-004',
      project: 'PRJ-007',
      inspectionDate: '2026-08-20',
      documents: ['MB-WB-NAD-007-P14', 'PHOTO-NAD-007-SITE-20260820', 'INVOICE-VND007-2026-08'],
    },
    signals: [
      {
        id: 'SIG-001',
        dimension: 'Inspection Risk',
        severity: 'CRITICAL',
        title: 'Physical Progress Mismatch — Reported vs Observed',
        explanation:
          'Vendor reported 88% physical completion on RCC bridge approach (PRJ-007). On-site inspection observations indicate approximately 71% actual completion. Discrepancy of ~17 percentage points. Measurement Book (MB) entries appear inconsistent with site photographs from the same date.',
        evidence: 'MB-WB-NAD-007-P14, PHOTO-NAD-007-SITE-20260820',
        recommendedAction:
          'Additional Verification Recommended: Dispatch independent third-party inspection with timestamped video evidence within 5 working days.',
      },
      {
        id: 'SIG-002',
        dimension: 'Document Intelligence',
        severity: 'HIGH',
        title: 'Quantity Reconciliation Issue in MB Records',
        explanation:
          'Measurement Book entries for the period July–August 2026 show quantity reconciliation discrepancies. Recorded quantities of RCC elements exceed field-measured volumes by a margin that requires explanation. Invoice from same period reflects the higher MB quantity.',
        evidence: 'MB-WB-NAD-007-P14, INVOICE-VND007-2026-08',
        recommendedAction:
          'Review Recommended: Correlate MB records, invoices, and independent measurement. Refer to District Engineer for technical review.',
      },
      {
        id: 'SIG-003',
        dimension: 'Vendor Risk',
        severity: 'HIGH',
        title: 'Repeated Network Association (Signatory Similarity)',
        explanation:
          'Synthetic graph analysis identifies a shared director/authorised-signatory signal between VND-007 and two other firms that participated in TND-004 bidding. This is a signal requiring verification, not evidence of collusion.',
        evidence: 'SYNTHETIC-GRAPH-VND007-NETWORK-2026',
        recommendedAction:
          'Additional Verification Recommended: Verify corporate structure separation through company registry. Do not treat network indicator alone as confirmation of wrongdoing.',
      },
      {
        id: 'SIG-004',
        dimension: 'Tender Risk',
        severity: 'MEDIUM',
        title: 'Repeated Bid Timing Pattern Across TND-004 / TND-007',
        explanation:
          'VND-007 and one associated firm show highly similar bid submission timestamps across TND-004 and TND-007. Submission clustering within a narrow time window is a monitoring signal. No direct collusion confirmed.',
        evidence: 'TENDER-AUDIT-WB-NAD-2026-Q2',
        recommendedAction:
          'Enhanced Monitoring Recommended: Flag for district vigilance cell review.',
      },
    ],
  },

  // ─── INV-002: VND-003 + VND-009 Network Investigation ────────────────────
  {
    id: 'INV-002',
    referenceNo: 'SAKSHAM/INV/RJ/AJM/2026-27/002',
    title: 'Repeated Tender Participation Overlap — VND-003 & VND-009',
    status: 'active',
    severity: 'HIGH',
    compositeScore: 74,
    vendorId: 'VND-003',
    tenderId: 'TND-008',
    projectId: 'PRJ-004',
    initiatedDate: '2026-08-25',
    lastUpdated: '2026-09-08',
    assignedOfficer: 'Nodal Officer (Demo District)',
    investigationChain: {
      vendor: 'VND-003',
      relatedVendor: 'VND-009',
      tender: 'TND-008',
      project: 'PRJ-004',
      inspectionDate: '2026-07-01',
      documents: ['TENDER-RJ-AJM-2026-003', 'TENDER-MH-NSK-2026-008'],
    },
    signals: [
      {
        id: 'SIG-005',
        dimension: 'Tender Risk',
        severity: 'HIGH',
        title: 'Recurring Tender Participation Overlap — VND-003 & VND-009',
        explanation:
          'VND-003 (Shree Ganesh Road Contractors) and VND-009 (Bharat Buildtech & Materials) have participated together in multiple tenders across Rajasthan and Gujarat districts. Bid prices within a narrow competitive band on 3 observed tenders. This pattern is a monitoring signal.',
        evidence: 'TENDER-PARTICIPATION-RJ-AJM-2026',
        recommendedAction:
          'Review Recommended: Analyse bid pricing and submission timing across co-participating tenders. Network indicators alone are not proof of collusion.',
      },
      {
        id: 'SIG-006',
        dimension: 'Vendor Risk',
        severity: 'HIGH',
        title: 'Inspection Progress Mismatch — VND-003 PRJ-004',
        explanation:
          'Site inspection for PRJ-004 (Rural Road Strengthening, Ajmer) shows discrepancy between vendor-reported 91% completion and observed on-site conditions. Engineering review pending.',
        evidence: 'INSPECTION-RJ-AJM-PRJ004-20260701',
        recommendedAction:
          'Additional Verification Recommended: Independent site inspection with photographic record.',
      },
      {
        id: 'SIG-007',
        dimension: 'Tender Risk',
        severity: 'MEDIUM',
        title: 'Submission Timing Cluster — TND-008',
        explanation:
          'Three bids in TND-008 were submitted within a 4-minute window. Two of these bidders have documented participation overlap with VND-003. Temporal clustering is a monitoring signal; it does not establish intent.',
        evidence: 'TENDER-MH-NSK-2026-008-TIMESTAMP-LOG',
        recommendedAction:
          'Enhanced Monitoring Recommended: Flag for district vigilance cell without premature conclusion.',
      },
    ],
  },

  // ─── INV-003: VND-005 Document Review ────────────────────────────────────
  {
    id: 'INV-003',
    referenceNo: 'SAKSHAM/INV/HR/AMB/2026-27/003',
    title: 'Invoice Correction Pattern & Signatory Similarity — VND-005',
    status: 'pending_review',
    severity: 'MEDIUM',
    compositeScore: 58,
    vendorId: 'VND-005',
    tenderId: 'TND-007',
    projectId: 'PRJ-006',
    initiatedDate: '2026-08-28',
    lastUpdated: '2026-09-05',
    assignedOfficer: 'Unassigned',
    investigationChain: {
      vendor: 'VND-005',
      tender: 'TND-007',
      project: 'PRJ-006',
      inspectionDate: null,
      documents: ['INVOICE-VND005-2026-07', 'INVOICE-VND005-2026-08-CORRECTED'],
    },
    signals: [
      {
        id: 'SIG-008',
        dimension: 'Document Intelligence',
        severity: 'MEDIUM',
        title: 'Repeated Invoice Corrections — PRJ-006',
        explanation:
          'Two invoices for PRJ-006 (Laboratory Equipment Supply) were submitted with corrections. The original invoices contained quantity figures that were subsequently revised downward. Pattern of correction is flagged for review.',
        evidence: 'INVOICE-VND005-2026-07, INVOICE-VND005-2026-08-CORRECTED',
        recommendedAction:
          'Review Recommended: Verify original and corrected invoice records against delivery challans and measurement documentation.',
      },
      {
        id: 'SIG-009',
        dimension: 'Vendor Risk',
        severity: 'MEDIUM',
        title: 'Authorised Signatory Similarity with VND-007',
        explanation:
          'Synthetic graph indicates a common authorised signatory relationship between VND-005 and VND-007 in non-MPLADS filings. This is a network signal requiring independent verification; it does not establish any misconduct.',
        evidence: 'SYNTHETIC-GRAPH-VND005-VND007-SIGNATORY',
        recommendedAction:
          'Additional Verification Recommended: Verify corporate filings and signatory declarations independently.',
      },
    ],
  },
];

/** Lookup helpers */
export const getInvestigationById = (id) => investigations.find(i => i.id === id) || null;
export const getInvestigationsByVendor = (vendorId) =>
  investigations.filter(i => i.vendorId === vendorId);
