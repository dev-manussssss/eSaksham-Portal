# Testing Strategy & Quality Assurance — SAKSHAM

## 1. Testing Philosophy

SAKSHAM enforces rigorous quality assurance across four tiers:
1. **Deterministic Unit Tests**: Mathematical risk algorithms and scoring boundaries must be 100% reproducible.
2. **Persistence & Refresh Integration Tests**: Automated tests proving that an investigation created by an officer persists identically across session disconnects and reloads.
3. **Graceful Degradation Tests**: Simulating the failure or outage of AI microservices to verify that core APIs and UI remain functional without throwing 500 errors or fabricating synthetic scores.
4. **End-to-End Workflow Verification**: Validating the full administrative review loop from anomaly alert to investigation closure.

---

## 2. Test Suites Directory Layout

```
/tests/
  ├── unit/
  │   ├── test_risk_scoring_rules.py    # Math bounds, weight normalization
  │   ├── test_entity_resolution.py     # Graph hash matching & DIN overlap
  │   └── test_exif_parser.py           # Timestamp and GPS extraction
  ├── integration/
  │   ├── test_persistence_on_reload.py # State survival across client reconnects
  │   ├── test_evidence_freeze.py       # Immutability of investigation snapshots
  │   └── test_rbac_district_scope.py   # Cross-district data leakage prevention
  ├── degradation/
  │   └── test_cv_service_outage.py     # System behavior when CV worker is killed
  └── fixtures/
      ├── sample_mb_scans/
      ├── sample_inspection_images/
      └── mock_tenders.json
```

---

## 3. Mandatory CI Quality Gates

- Zero regressions in deterministic risk score formulas.
- No unhandled exceptions on missing external service responses.
- 100% enforcement of role-based data filtering.
