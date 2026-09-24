# SAKSHAM e-Portal — Rebuild Plan
**Based on:** 22_AUDIT_FINDINGS.md forensic audit
**Status:** DRAFT — requires approval before execution

---

> [!IMPORTANT]
> DO NOT START REBUILD until P0 blockers (AUD-001 through AUD-006) are resolved.
> Specifically: rotate all API keys before any code changes.

---

## Phase 0 — Safety / Backup / Branching

**Objective:** Preserve current state, rotate credentials, create a clean branch.

**Actions:**
1. Create git branch `audit-baseline` from current HEAD (preserves pre-rebuild state)
2. Rotate Groq API Key 1 and Key 2 — update `.env` with new values
3. Rotate Supabase anon key — update `.env`
4. Remove hard-coded fallback strings from `backend/src/config.js`
5. Remove `Share ChatGPT.md` from root (1.2MB bloat, not project documentation)
6. Add `.gitleaks.toml` pre-commit hook to prevent future secret commits
7. Back up current Supabase data via `pg_dump` or Supabase dashboard export

**Files:** `.env`, `backend/src/config.js`, `Share ChatGPT.md`, `.gitleaks.toml` (new), `.gitignore`
**Dependencies:** None
**Migration Risk:** None (no code changes)
**Tests:** Verify backend starts with env vars only (no fallback string)
**Rollback:** Return to `audit-baseline` branch
**Completion Criteria:** `grep -r "gsk_" . --include="*.js"` returns 0 matches; `grep -r "eyJhbGci" . --include="*.js"` returns 0 matches

---

## Phase 1 — Architecture Foundation

**Objective:** Split monolithic backend into layered architecture.

**Actions:**
1. Create directory structure:
   ```
   backend/src/
     routes/          (HTTP route definitions only)
     controllers/     (request/response handling)
     services/        (business logic)
     repositories/    (DB queries via Supabase)
     middleware/      (auth, validation, rate-limit, logging)
     utils/           (shared helpers)
   ```
2. Move status machine and RBAC to `utils/`
3. Create structured error classes (VALIDATION_ERROR, AUTH_ERROR, etc. per Guidelines §15)
4. Add `express-rate-limit` middleware
5. Fix CORS — whitelist `process.env.FRONTEND_URL` only

**Files:** All `backend/src/` — restructured but logic preserved
**Dependencies:** Phase 0
**Migration Risk:** MEDIUM (same logic, new structure)
**Tests:** All existing manual flows still work after restructure
**Rollback:** Git revert; `audit-baseline` preserved
**Completion Criteria:** 0 business logic lines in HTTP handlers

---

## Phase 2 — Auth + RBAC

**Objective:** Real authentication via Supabase Auth; role from JWT, not header.

**Actions:**
1. Enable Supabase Auth on project
2. Create auth middleware: verify Supabase JWT, extract role from `user_metadata.role`
3. Remove all `req.headers['x-saksham-role']` reads — replaced by middleware-injected `req.user`
4. Implement `POST /api/auth/login` → delegates to Supabase Auth
5. Implement `POST /api/auth/logout` → invalidates session
6. Frontend: replace localStorage-only session with Supabase client auth (`@supabase/supabase-js`)
7. Remove pre-filled password from `Login.jsx` (gate on `import.meta.env.DEV`)
8. Remove pre-filled CAPTCHA from `Login.jsx`
9. Remove `POST /api/seed` from production builds (env guard)
10. Create Supabase user profiles per role (seed for demo)

**Files:** `backend/src/middleware/auth.js` (new), `frontend/src/auth/AuthContext.jsx`, `frontend/src/pages/Login.jsx`, all route handlers
**Dependencies:** Phase 0, Phase 1
**Migration Risk:** HIGH — all role-gated flows change
**Tests:** Each role can log in; wrong credentials return 401; role escalation via header returns 403
**Rollback:** Feature flag to toggle demo-mode auth
**Completion Criteria:** Zero `x-saksham-role` header reads in backend; all RBAC checks use JWT-extracted role

---

## Phase 3 — Database + Domain Model

**Objective:** Complete schema, enable RLS, fix constraint bugs.

**Actions:**
1. Migration 03 — Fix audit_logs: `ALTER TABLE audit_logs ALTER COLUMN project_id DROP NOT NULL`
2. Migration 04 — Add `bids` and `bid_participants` tables
3. Migration 05 — Add `inspections`, `geotags`, `alerts`, `notifications`, `risk_signals` tables
4. Migration 06 — Drop orphaned `risk_scores` table (after confirming no live usage)
5. Enable RLS on ALL tables: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
6. Create RLS policies per role using Supabase JWT claims
7. Canonicalize vendor field: keep `company_name`, remove `name` column ambiguity
8. Add uniqueness constraints where missing (e.g., `vendors.gstin`)

**Files:** `database/03_fix_audit_logs.sql` through `database/07_rls_policies.sql` (new migration files)
**Dependencies:** Phase 0 (key rotation before enabling RLS)
**Migration Risk:** HIGH — RLS can break queries; test thoroughly in staging
**Tests:** Each role's DB queries return correct row subset under RLS; vendor audit logs persist for non-project actions
**Rollback:** Migration rollback scripts
**Completion Criteria:** All 15+ tables have RLS enabled with documented policies

---

## Phase 4 — API / Service Layer

**Objective:** Validated, authorized, audited API endpoints.

**Actions:**
1. Add input validation middleware (use `zod` or manual allowlists) to all mutation endpoints
2. Fix vendor update endpoint — explicit field allowlist; `is_blacklisted` requires privileged action
3. Fix vendor ID generation — use UUID
4. Add rate limiting to all routes (global: 100/min, OCR/LLM: 10/min, auth: 5/min)
5. Add MIME type validation to file upload (allowlist: PDF, images)
6. Add prompt injection protection to extractor
7. Validate LLM-returned flag_codes against RISK_* taxonomy
8. Fix AI-auto-status-change: AI produces recommendation only, not status update
9. Fix CORS to frontend-URL only
10. Add `/api/health` with real DB and Groq connectivity indicators

**Files:** `backend/src/routes/`, `backend/src/controllers/`, `backend/src/middleware/validate.js` (new), `backend/src/ai/extractor.js`, `backend/src/ai/groqFailover.js`, `backend/src/index.js` (now just startup)
**Dependencies:** Phase 1-3
**Migration Risk:** MEDIUM
**Tests:** Unit tests for each validator; integration tests for auth-gated routes
**Rollback:** Per-route feature flags if needed
**Completion Criteria:** All endpoints pass input validation; 0 raw `req.body` spreads without allowlisting

---

## Phase 5 — Project Lifecycle

**Objective:** Correct project status machine, human-in-the-loop actions.

**Actions:**
1. Remove automatic status change from document upload pipeline (AUD-015)
2. Document upload: create AI flag → send notification → require human action
3. Align frontend status vocabulary with backend `PROJECT_STATUS` constants
4. Build shared status constants module used by both frontend and backend
5. Add `ProjectRecommendation` and `ProjectSanction` records to lifecycle
6. Test all status transitions in `statusMachine.js`

**Files:** `backend/src/services/projectService.js`, `frontend/src/data/index.js` (status config), shared constants
**Dependencies:** Phase 4
**Migration Risk:** MEDIUM
**Tests:** Unit test all valid/invalid status transitions; E2E test document-upload-to-flag flow
**Rollback:** Restore auto-status-change behavior if demo requires it (env flag)
**Completion Criteria:** Document upload never autonomously changes project status; status vocabulary consistent

---

## Phase 6 — Vendor / Procurement Intelligence

**Objective:** Complete vendor domain with bids data, real collusion detection.

**Actions:**
1. Wire `bids` and `bid_participants` tables to tender creation flow
2. Activate `SOLE_BIDDER_WINS` signal in vendorRiskEngine (AUD-011)
3. Activate `BID_DISCOUNT_ANOMALY` signal
4. Build basic bid analytics: same-IP detection (store bid metadata), bid timing analysis
5. Fix vendor create/edit forms to use new allowlisted API

**Files:** `backend/src/services/vendorService.js`, `backend/src/vendorRiskEngine.js`, `database/04_bids.sql`
**Dependencies:** Phase 3, Phase 4
**Migration Risk:** LOW (additive)
**Tests:** Vendor risk score for vendor with sole-bidder history > vendor without
**Completion Criteria:** All 4 risk dimensions produce ACTIVE (not ANALYSIS_PENDING) signals for vendors with sufficient data

---

## Phase 7 — Risk Engine

**Objective:** Complete, explainable, deterministic risk scoring.

**Actions:**
1. Add model version tracking to all risk score records
2. Add data freshness metadata to risk signals
3. Add confidence/coverage metadata
4. Create project-level risk scoring (utilize/populate `risk_scores` or retire it)
5. Implement structured RISK_* taxonomy enum shared with frontend

**Files:** `backend/src/vendorRiskEngine.js`, `backend/src/ai/ruleEngine.js`, `database/`
**Dependencies:** Phase 6
**Migration Risk:** LOW
**Tests:** Same vendor + same data = same score (determinism test); human-readable explanation for each signal
**Completion Criteria:** Every risk score has version, timestamp, signal evidence, confidence metadata

---

## Phase 8 — OCR / AI Evidence Pipeline

**Objective:** Safe, validated, prompt-injection-protected AI document processing.

**Actions:**
1. Add MIME type allowlist to file upload (PDF, JPEG, PNG only)
2. Add file content validation (magic bytes, not just MIME header)
3. Add prompt injection protection prefix to all LLM calls
4. Validate LLM output flag_codes against RISK_* enum
5. Mark unsupported file types as `ANALYSIS_PENDING` not error
6. Add per-analysis-run confidence score

**Files:** `backend/src/ai/extractor.js`, `backend/src/ai/groqFailover.js`
**Dependencies:** Phase 4
**Migration Risk:** LOW
**Tests:** Upload crafted injection file → LLM output unchanged; Unknown MIME type → 400 response
**Completion Criteria:** 0 unsanitized document text reaches LLM prompt

---

## Phase 9 — Audit Trail / Reporting

**Objective:** Complete, immutable audit trail for all domain actions.

**Actions:**
1. Fix audit_logs nullable project_id (Phase 3)
2. Ensure every state-changing endpoint writes an audit event
3. Add correlation ID to request middleware (traceable across logs)
4. Add structured server logging (JSON format)
5. Create reporting queries for district-level, state-level, national-level views

**Files:** `backend/src/middleware/correlationId.js` (new), audit event service
**Dependencies:** Phase 3
**Migration Risk:** LOW
**Tests:** Every VENDOR_CREATED action produces audit log row; audit log contains actor, action, old/new state
**Completion Criteria:** Zero state changes without audit event

---

## Phase 10 — Role-Specific UI

**Objective:** Correct, role-appropriate UI with no misleading content.

**Actions:**
1. Remove `NIC Gateway Active` from Sidebar — replace with real health indicator (AUD-003)
2. Remove/build dedicated pages for aliased routes (AUD-010): `/inspections`, `/fraud-graph`, `/notifications`, `/compliance`, `/implementing-agencies`
3. Replace pre-filled demo credentials with `import.meta.env.DEV` guard
4. Remove mock data from production bundle — implement LiveDataProvider/MockDataProvider split
5. Fix status display in frontend to match backend status vocabulary (AUD-021)
6. Align sidebar fraud-graph nav item with actual fraud graph visualization (or remove until built)
7. Update `document` route to not render ProjectDetail without ID

**Files:** `frontend/src/components/Sidebar.jsx`, `frontend/src/App.jsx`, `frontend/src/pages/` (new pages), `frontend/src/data/`
**Dependencies:** Phase 2 (auth), Phase 5 (status vocab)
**Migration Risk:** LOW
**Tests:** Sidebar shows no fake government integration badges; each role sees only their authorized nav items
**Completion Criteria:** Zero misleading/fake indicators; every route renders its correct purpose-built page

---

## Phase 11 — Error Handling / Observability

**Objective:** Structured errors, health monitoring, no raw stack traces.

**Actions:**
1. Create structured error classes per Guidelines §15
2. Add global error handler that strips stack traces from production responses
3. Add request correlation ID middleware
4. Implement `/api/health` with DB + Groq status (real, not hardcoded `aiFailoverActive: true`)
5. Add structured JSON logging to backend

**Files:** `backend/src/middleware/errorHandler.js` (new), `backend/src/utils/errors.js` (new)
**Dependencies:** Phase 1
**Migration Risk:** LOW
**Tests:** 500 error returns structured error (no stack trace) in production mode
**Completion Criteria:** Frontend never receives raw Postgres errors; health endpoint reflects actual connectivity

---

## Phase 12 — Testing / QA

**Objective:** Baseline test coverage for all critical modules.

**Actions:**
1. Set up test runner (Vitest for backend unit tests, Playwright for E2E)
2. Write unit tests:
   - `vendorRiskEngine.js` — all 4 dimensions, boundary conditions
   - `ruleEngine.js` — BOQ exceeded, financial/physical divergence, MB mismatch
   - `rbac.js` — full permission matrix (7 roles × all permissions)
   - `statusMachine.js` — all valid transitions, all invalid transitions
3. Write integration tests:
   - Login flow (each role)
   - Document upload → AI analysis → flag creation
   - Project action (hold, release, approve)
   - Vendor risk score calculation
4. Write E2E smoke tests (Playwright):
   - Login → dashboard → navigate → logout (each role)

**Files:** `tests/unit/`, `tests/integration/`, `tests/e2e/` (all new)
**Dependencies:** Phase 1-4
**Migration Risk:** None (new code)
**Tests:** ARE the deliverable
**Completion Criteria:** Unit test `npm test` exits 0; `npm run test:e2e` smoke tests pass

---

## Phase 13 — Deployment Hardening

**Objective:** Production-ready deployment with correct Docker, env, and build config.

**Actions:**
1. Create `docker/Dockerfile.backend` (Node.js 20 LTS, multi-stage)
2. Create `docker/Dockerfile.frontend` (Vite build + nginx static serve)
3. Fix docker-compose.yml — correct references, ports, remove Redis stub
4. Fix `vite.config.js` — use `VITE_API_URL` env var for production
5. Add `backend/src/scripts/migrate.js` — run migrations in order
6. Add `backend/src/scripts/healthCheck.js` — startup verification
7. Document all required env vars in `docs/16_DEPLOYMENT.md`
8. Add `.env.example` with all required keys (no values)

**Files:** `docker/Dockerfile.backend`, `docker/Dockerfile.frontend`, `docker/docker-compose.yml`, `frontend/vite.config.js`, `docs/16_DEPLOYMENT.md`
**Dependencies:** Phase 1-12
**Migration Risk:** LOW
**Tests:** `docker-compose up` succeeds; all containers healthy
**Completion Criteria:** Clean `docker-compose up` → working app; documented env vars; no localhost hard-codes

---

## Phase 14 — Final Security + Release Audit

**Objective:** Pre-release security pass before any demo/submission.

**Checklist:**
- [ ] `grep -r "gsk_\|eyJhbGci\|supabase.co" . --include="*.js" --include="*.jsx"` → 0 matches
- [ ] All endpoints respond 401/403 without valid JWT
- [ ] `/api/seed` returns 403 in production
- [ ] CORS allows only frontend URL
- [ ] Sidebar has no fake government integration claim
- [ ] Login form has no pre-filled credentials in production mode
- [ ] All risk score signals have source_field evidence linkage
- [ ] No LLM output reaching the DB without taxonomy validation
- [ ] Production build size documented
- [ ] Source maps disabled or restricted for production
- [ ] All migrations applied and verified in Supabase
- [ ] Demo seeded data clearly labeled as synthetic

---

## What Must NOT Be Changed

- `vendorRiskEngine.js` scoring architecture (35/25/25/15 weights, 4-dimension structure) — correct
- `statusMachine.js` ALLOWED_TRANSITIONS graph — correct state machine
- `roleNavigation.js` role-to-nav structure — correct role separation
- Soft-delete pattern for vendors (`is_active=false`, never hard-delete) — correct
- Groq dual-key failover mechanism — correct resilience pattern
- Audit log append-only pattern — correct
- `canPerformAction()` permission matrix structure — correct (just needs real auth behind it)

## What to Delete (only after verification)

| File | Verification Required |
|---|---|
| `Share ChatGPT.md` (root) | Scan for unique requirements |
| `database/01_saksham_schema.sql` `risk_scores` table | Confirm no backend references |
| Stub service READMEs | Replace with real adapter code |
| Pre-audit docs in `/docs/` | Archive after new authoritative docs created |

## What to Replace

| Current | Replacement |
|---|---|
| `x-saksham-role` header auth | Supabase Auth JWT |
| `app.use(cors())` | `cors({ origin: process.env.FRONTEND_URL })` |
| `http://localhost:3001` in vite.config | `VITE_API_URL` env var |
| Fake `NIC Gateway Active` | Real `/api/health` polling indicator |
| Mock data in production path | MockDataProvider/LiveDataProvider adapter |

## What Can Remain (After Security Fixes)

- Express + Supabase stack — correct choice
- Groq OCR/LLM integration — working
- `pdf-parse` for PDF extraction — working
- `multer` for file uploads — working (add MIME validation)
- All existing Supabase tables (after RLS and schema fixes)
- Frontend component structure (Sidebar, Layout, Header, etc.) — structurally sound
