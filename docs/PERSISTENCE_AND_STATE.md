# Persistence & State Management — SAKSHAM

## 1. Principles & Architectural Invariants

State persistence in SAKSHAM is governed by strict rules designed to eliminate UI ephemeral bugs, data loss, and phantom re-computations:

1. **Database is Sole Source of Truth**:
   - The frontend browser state is transient and subordinate.
   - All filters, investigation notes, alert resolutions, and risk assessments are committed to the central database before UI confirmation.
2. **Persistence Across Refreshes & Logins**:
   - When an officer opens an investigation or modifies an alert filter, the state is persisted. Refreshing the browser or logging in from a different terminal (e.g. switching from desktop to tablet in the field) reproduces the exact same state.
3. **No Autonomous AI Rerun on Refresh**:
   - Analytical results are tagged with an entity hash and evaluation version.
   - When an officer views a project page, the system loads the persisted evaluation record. The system **never re-runs AI/OCR/CV inference on page load**.
4. **Optimistic Locking & Concurrency Control**:
   - Record mutations utilize an integer version column (`version_id`). If two officers simultaneously edit an investigation dossier, the second update will trigger an optimistic lock notification rather than silently overwriting data.

---

## 2. Client-Side State Hydration

- Client applications fetch state via REST APIs with cache-control headers (`ETag`, `Last-Modified`).
- Local storage or session storage is restricted strictly to user UI preferences (e.g., collapsed sidebar state, localized theme preference), never domain business data or security credentials.
