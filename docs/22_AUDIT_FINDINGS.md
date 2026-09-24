# SAKSHAM e-Portal — Forensic Audit Findings
**Audit Date:** 2026-09-23
**Guidelines Baseline:** SIH_2026_MPLADS_GUIDELINES_2.0_REVISED.md (1383 lines, fully read)
**Audit Mode:** Single continuous forensic pass

---

## Audit Status: COMPLETE

---

## Verified Stack

| Layer | Expected | Actual | Match |
|---|---|---|---|
| Frontend | React | React 18.3.1 + Vite 5.4.8 | ✅ |
| Routing | React Router | react-router-dom 6.26.2 | ✅ |
| Styling | TailwindCSS | Tailwind 3.4.13 | ✅ |
| Backend | Node.js/Express | Express 4.21.0 (ESM) | ✅ |
| Database | Supabase/PostgreSQL | Supabase + anon key only (no service-role) | ⚠️ |
| LLM | Groq | Groq dual-key failover | ✅ |
| OCR | Groq+pdf-parse | pdf-parse + Groq + heuristic fallback | ✅ |
| Auth | Supabase Auth JWT | **localStorage + hardcoded demo profiles** | ❌ |
| CI/CD | Expected | **NONE** | ❌ |
| Docker | Partial | compose.yml with broken references | ❌ |
| Tests | Unit+Integration+E2E | Playwright installed, **0 test files** | ❌ |
| Microservices | 5 services expected | **All README-only stubs** | ❌ |

---

## P0 — BLOCKERS

### AUD-001 — Exposed Secrets in Source Code
**Severity:** BLOCKER | **Category:** Security
**Location:** `.env:5-6`, `backend/src/config.js:10-15`
**Observed:** Two live Groq API keys hard-coded in `.env`. Supabase URL and anon key hard-coded as fallback strings in `config.js`. These survive in source even if `.env` is rotated.
**Impact:** Financial exposure (billed Groq keys), database exposure (Supabase anon key).
**Recommendation:** 1) Rotate all keys immediately. 2) Remove ALL hard-coded fallback values from `config.js`. 3) Add secret scanning pre-commit hook.
**Status:** Open

### AUD-002 — No Real Authentication — Complete Auth Bypass
**Severity:** BLOCKER | **Category:** Security/Auth
**Location:** `frontend/src/auth/AuthContext.jsx`, `frontend/src/pages/Login.jsx`, `backend/src/rbac.js:3-8`
**Observed:** `login()` simply calls `setSession(profile)` locally. Backend reads role from `x-saksham-role` HTTP header supplied by the client. `rbac.js` contains comment: "DEMO-ONLY AUTH NOTICE: This is NOT secure production authentication."
**Impact:** Any client sets any role header = complete RBAC bypass. All permission checks are theater.
**Recommendation:** Implement Supabase Auth JWT. Verify JWT on every backend request. Extract role from token claims.
**Status:** Open

### AUD-003 — Fake "NIC Gateway Active" in Sidebar
**Severity:** BLOCKER | **Category:** UI Integrity/Security
**Location:** `frontend/src/components/Sidebar.jsx:97`
**Observed:** Pulsing green dot with label "NIC Gateway Active" visible to all users in the sidebar footer. NIC integration does not exist.
**Impact:** False government integration claim violates Guidelines 2.0 §6.
**Recommendation:** Remove entirely. Replace with factual `/api/health` polling indicator.
**Status:** Open

### AUD-004 — Docker Deployment Completely Broken
**Severity:** BLOCKER | **Category:** Deployment
**Location:** `docker/docker-compose.yml`
**Observed:** References non-existent `Dockerfile.backend`, `Dockerfile.frontend`, `../database/schema.sql`. Backend port in compose is 8000 but server runs on 3001. Redis defined but never used.
**Impact:** `docker-compose up` fails immediately.
**Recommendation:** Create Dockerfiles, correct all references, align ports, remove Redis until implemented.
**Status:** Open

### AUD-005 — Wildcard CORS
**Severity:** BLOCKER | **Category:** Security
**Location:** `backend/src/index.js:18`
**Observed:** `app.use(cors())` with no options = allows `*` all origins.
**Impact:** Combined with AUD-002, any website can impersonate any role.
**Recommendation:** `cors({ origin: process.env.FRONTEND_URL })`
**Status:** Open

### AUD-006 — Unauthenticated Database Seed Endpoint
**Severity:** BLOCKER | **Category:** Security
**Location:** `backend/src/index.js:466-473`
**Observed:** `POST /api/seed` — no auth check, destroys and recreates all data for any caller.
**Impact:** One unauthenticated POST wipes all production data.
**Recommendation:** Remove from production. Guard with `NODE_ENV === 'development'` check.
**Status:** Open

---

## P1 — HIGH PRIORITY

### AUD-007 — Demo Password Pre-filled in Login Form
**Severity:** CRITICAL | **Category:** Auth
**Location:** `frontend/src/pages/Login.jsx:58`
**Observed:** `useState('Demopass@2026')` — password field pre-filled. CAPTCHA also pre-filled. No actual credential verification occurs.
**Recommendation:** Implement `supabase.auth.signInWithPassword()`. Gate pre-fills on `import.meta.env.DEV`.
**Status:** Open

### AUD-008 — Insecure Direct Object Reference on Vendor Records
**Severity:** CRITICAL | **Category:** Security
**Location:** `backend/src/index.js:517-564`
**Observed:** IDOR protection relies on client-supplied role header. Setting `x-saksham-role: DISTRICT_AUTHORITY` bypasses vendor-own-record restriction. PAN, GSTIN, bank_account_hash accessible to anyone.
**Recommendation:** Fix root AUD-002. All RBAC meaningful only with real JWT.
**Status:** Open

### AUD-009 — Vendor Update Accepts Arbitrary Fields (No Allowlist)
**Severity:** HIGH | **Category:** Data Integrity
**Location:** `backend/src/index.js:636-641`
**Observed:** `const updates = { ...req.body }; delete updates.id; delete updates.created_at;` — sends entire body to Supabase including `is_blacklisted`.
**Impact:** Blacklisting bypass. Arbitrary data injection.
**Recommendation:** Explicit field allowlist. `is_blacklisted` change requires dedicated auditable action.
**Status:** Open

### AUD-010 — Multiple Routes Aliased to Wrong Pages
**Severity:** HIGH | **Category:** Architecture/UI
**Location:** `frontend/src/App.jsx:78, 85-87, 93-97`
**Observed:** `/inspections`→WorkProgress, `/fraud-graph`→InvestigationDashboard, `/documents`→ProjectDetail (no id = 404), `/compliance`→VendorDashboard, `/notifications`→InvestigationDashboard.
**Recommendation:** Build dedicated pages or remove misleading nav items.
**Status:** Open

### AUD-011 — Missing Bids/BidParticipants Table — 25% Risk Vector Incomplete
**Severity:** HIGH | **Category:** Data/Risk Engine
**Location:** `backend/src/vendorRiskEngine.js:143-151, 197-198`, `database/01_saksham_schema.sql`
**Observed:** Collusion risk dimension (25%) and part of financial anomaly (25%) explicitly marked `ANALYSIS_PENDING` in the engine. `bids` table not in schema.
**Impact:** Vendor risk score is structurally incomplete. Sole-bidder detection and bid-discount anomaly non-functional.
**Recommendation:** Migration 03 — add `bids` and `bid_participants` tables.
**Status:** Open

### AUD-012 — Monolithic Backend (998-line Single File)
**Severity:** HIGH | **Category:** Architecture
**Location:** `backend/src/index.js`
**Observed:** All 12 route groups, business logic, AI orchestration, audit logging in one file. Zero service/repository layering.
**Impact:** Untestable, unmaintainable, violates Guidelines §14.
**Recommendation:** Split into `routes/`, `controllers/`, `services/`, `repositories/` during rebuild.
**Status:** Open

### AUD-013 — No Rate Limiting on Any Endpoint
**Severity:** HIGH | **Category:** Security
**Location:** `backend/src/index.js` (entire)
**Observed:** Zero rate limiting. AI/OCR endpoint (`POST /api/projects/:id/documents`) can be spammed at developer's API cost.
**Recommendation:** `express-rate-limit`. OCR: 10 req/min/IP. Auth: 5 req/min/IP.
**Status:** Open

### AUD-014 — Prompt Injection via Uploaded Files
**Severity:** HIGH | **Category:** Security/AI
**Location:** `backend/src/ai/extractor.js:14-16`
**Observed:** Non-PDF files decoded as UTF-8 and passed directly to LLM prompt without sanitization.
**Impact:** Crafted uploads can manipulate AI risk assessments.
**Recommendation:** Strict MIME allowlist. Sanitize text before LLM prompt. Add system instruction protection prefix.
**Status:** Open

### AUD-015 — AI Autonomously Changes Project Status (No Human-in-the-Loop)
**Severity:** HIGH | **Category:** Data Integrity/Architecture
**Location:** `backend/src/index.js:248-266`
**Observed:** Document upload pipeline auto-sets `status = INSPECTION_REQUIRED` if AI produces CRITICAL flag. No human authorization required.
**Impact:** Violates Guidelines §2.4 human-in-the-loop requirement.
**Recommendation:** AI produces recommendation only. Human action endpoint triggers status change.
**Status:** Open

### AUD-016 — Zero RLS Policies on All 15 Database Tables
**Severity:** HIGH | **Category:** Database/Security
**Location:** `database/01_saksham_schema.sql`
**Observed:** No `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` or `CREATE POLICY` anywhere in schema. Backend uses anon key as fallback (leaks from AUD-001).
**Impact:** All table data exposed to any anon-key holder.
**Recommendation:** Enable RLS. Define role-based policies using Supabase JWT claims.
**Status:** Open

### AUD-017 — Missing Domain Entities (Bids, Inspections, Geotag, Alerts, etc.)
**Severity:** HIGH | **Category:** Database
**Location:** `database/01_saksham_schema.sql`
**Observed:** Missing: `Bid`, `BidParticipant`, `Inspection` (standalone), `Geotag`, `RiskSignal`, `Alert`, `Notification`, `SystemConfiguration`, `ProjectRecommendation`, `ProjectSanction`.
**Recommendation:** Phased migrations 03-06 to add missing entities.
**Status:** Open

### AUD-018 — All 5 Microservices Are README-Only Stubs
**Severity:** HIGH | **Category:** Architecture
**Location:** `/services/{fraud-graph,risk-engine,ocr-service,cv-service,llm-service}/`
**Observed:** Each directory contains only `README.md`. Zero code. Fraud graph is navigable from sidebar but shows InvestigationDashboard.
**Recommendation:** Implement mock adapter pattern per Guidelines §24 for each service.
**Status:** Open

---

## P2 — MEDIUM PRIORITY

### AUD-019 — Collision-Prone Vendor ID Generation
**Severity:** MEDIUM | **Location:** `index.js:591`
**Observed:** `VND-${Date.now().toString().slice(-4)}` — last 4 digits only. High collision risk.
**Recommendation:** Use UUIDs.

### AUD-020 — Orphaned `risk_scores` Table
**Severity:** MEDIUM | **Location:** `01_saksham_schema.sql` (table `risk_scores`)
**Observed:** Project-scoped `risk_scores` table exists in schema but zero backend code references it.
**Recommendation:** Drop in next migration or wire to project-level risk scoring.

### AUD-021 — Status Terminology Mismatch Frontend vs Backend
**Severity:** MEDIUM | **Location:** `statusMachine.js` vs `data/index.js:getStatusConfig()`
**Observed:** Backend uses `UNDER_IMPLEMENTATION, ON_HOLD, INSPECTION_REQUIRED`. Frontend getStatusConfig() handles `active, stalled, tendering` — disjoint vocabularies. `ON_HOLD` renders as unknown/default style.
**Recommendation:** Shared status constants file used by both layers.

### AUD-022 — Audit Log Insert Fails for Non-Project Actions (NOT NULL Violation)
**Severity:** MEDIUM | **Location:** `01_saksham_schema.sql:224`, `index.js:613,655,698,820`
**Observed:** `audit_logs.project_id NOT NULL` but backend inserts `project_id: null` for VENDOR_CREATED, VENDOR_UPDATED, VENDOR_DEACTIVATED, TENDER_PUBLISHED. These inserts throw Postgres NOT NULL errors.
**Impact:** Vendor and tender audit trails are broken and unrecorded.
**Recommendation:** `ALTER TABLE audit_logs ALTER COLUMN project_id DROP NOT NULL;`

### AUD-023 — LLM Flag Codes Not Validated Against Taxonomy
**Severity:** MEDIUM | **Location:** `backend/src/ai/groqFailover.js:130-156`
**Observed:** LLM-returned `flag_code` inserted directly into `ai_flags` without validation.
**Impact:** Hallucinated flag codes pollute flags table.
**Recommendation:** Validate against `RISK_*` taxonomy enum. Reject unknown codes.

### AUD-024 — Vite Proxy Hard-coded to localhost — Production Will Fail
**Severity:** MEDIUM | **Location:** `frontend/vite.config.js:10`
**Observed:** `target: 'http://localhost:3001'`
**Recommendation:** Use `VITE_API_URL` env var. Configure correctly for each environment.

### AUD-025 — Zero Test Coverage
**Severity:** MEDIUM | **Location:** `/tests/`
**Observed:** `"test": "echo Error: no test specified && exit 1"`. Playwright installed, 0 test files.
**Recommendation:** Priority unit tests: vendorRiskEngine (4 dimensions), ruleEngine (boundary conditions), rbac (permission matrix), statusMachine (all valid/invalid transitions).

### AUD-026 — ~90KB Mock Data Bundled Into Production Frontend
**Severity:** MEDIUM | **Location:** `frontend/src/data/mock/`
**Observed:** 5 mock files (~68KB) + mockData.js (20KB) exported from data/index.js and imported in Login.jsx.
**Recommendation:** MockDataProvider / LiveDataProvider adapter pattern. Production uses LiveDataProvider only.

---

## P3 — LOW PRIORITY

### AUD-027 — 25 Pre-Audit Docs Need Reconciliation (Not Authoritative)
**Severity:** LOW | `/docs/` (25 files)
**Action:** Archive after rebuilding authoritative /docs structure. Do not delete yet.

### AUD-028 — 1.2MB ChatGPT Export in Repository Root
**Severity:** LOW | `Share ChatGPT.md`
**Action:** Scan for unique requirements, then delete.

### AUD-029 — Dual vendor.name / vendor.company_name Field Ambiguity
**Severity:** LOW | `index.js:504-508`, schema
**Recommendation:** Canonicalize to `company_name`. Remove all `|| v.name` fallbacks.

### AUD-030 — Demo Credentials Pre-filled in Production Login
**Severity:** LOW | `Login.jsx:58-59`
**Recommendation:** Gate on `import.meta.env.DEV`.

---

## NOT AUDITABLE (with reason)

| Item | Reason |
|---|---|
| RLS in live Supabase dashboard | No dashboard access |
| Git history secret scan | Terminal permission denied |
| Production bundle analysis | Read-only audit |
| AI flag accuracy | Requires live evaluation data |
| Supabase storage bucket policies | No dashboard access |
