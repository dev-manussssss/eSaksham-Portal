# Investigation System & Case Management — SAKSHAM

## 1. Purpose

The Investigation System transforms automated anomaly detection into formal, actionable administrative cases. It provides District Authorities and Nodal Officers with structured case files containing immutable evidence snapshots, statutory timelines, and audit trails.

---

## 2. Core Requirements & Invariants

1. **Persistent Unique ID**: Every investigation receives a permanent case identifier formatted as `INV-{YEAR}-{DISTRICT}-{SERIAL}` (e.g., `INV-2026-VARANASI-0042`).
2. **Evidence Freeze Snapshot**: Upon opening an investigation, all referenced documents, photo hashes, risk scores, and vendor relations are snapshotted into an immutable case ledger. Future updates to the live project do not mutate the historical evidence packet.
3. **Multi-Role Annotations**:
   - Nodal Officer records preliminary inspection findings.
   - District Magistrate issues show-cause notices or administrative decisions.
   - Junior Engineer attaches compliance or rectification documentation.
4. **Exportable Briefing Dossier**:
   - Generates an executive PDF/Print-ready briefing summarizing:
     - Allegation / Anomaly Type
     - Risk Dimensions & Numerical Scores
     - Primary Evidence Links (Side-by-side photo comparison, OCR discrepancy bounding box, DIN network graph)
     - Officer Action Timeline

---

## 3. Case Lifecycle States

```
[ ALERT_TRIGGERED ]
         │
         ▼
[ CASE_OPENED ] ──(Assign Investigating Officer)
         │
         ▼
[ UNDER_FIELD_INSPECTION ]
         │
         ├───▶ [ SHOW_CAUSE_ISSUED ] ───▶ [ EXPLANATION_SUBMITTED ]
         │                                       │
         ▼                                       ▼
[ CLOSED_JUSTIFIED ]                   [ CLOSED_ACTION_TAKEN ]
(Legitimate deviation verified)        (Recovery, blacklisting, de-sanction)
```
