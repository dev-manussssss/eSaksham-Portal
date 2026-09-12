# Demo Mode Architecture & Invariants — SAKSHAM

## 1. Purpose

Demo Mode allows stakeholders, evaluators, and training officers to experience the full end-to-end intelligence workflows of SAKSHAM in self-contained, isolated sandboxes without connecting to live government databases.

---

## 2. Invariants & Rules for Demo Mode

1. **State Persistence within Demo Session**:
   - Even in demo mode, modifications (e.g. creating an investigation case, adding officer justification notes) **must persist across browser refreshes**.
   - Backed by an in-memory or SQLite database sandbox that preserves state during the active user session.
2. **Deterministic Pre-Computed ML/AI Fixtures**:
   - To guarantee instantaneous response times and zero external dependency on heavy GPU clusters, demo mode uses authentic, realistic fixtures:
     - Real OCR bounding-box coordinates on sample Measurement Book scans.
     - Computed pHash collisions demonstrating duplicate photo reuse across two sample projects.
     - Deterministic Fraud Graph clusters showing 3 cartel bidders sharing a single director DIN.
3. **Strict Truth in Labeling**:
   - The UI displays an unobtrusive top badge: `[DEMO / TRAINING ENVIRONMENT - SANDBOX DATA]`.
   - Never use fictional or mocking names for government authorities. All sample data models official administrative workflows faithfully.
