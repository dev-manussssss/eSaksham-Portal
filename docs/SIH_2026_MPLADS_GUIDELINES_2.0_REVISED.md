# SIH 2026 MPLADS / e-Saksham — Master Rebuild & Engineering Guidelines v2.0

**Project:** SIH 2026 MPLADS — AI-powered anomaly, fraud and inefficiency detection platform
**Working Product Name:** e-Saksham
**Problem Statement:** SIH26102 (PS 102)
**Document Purpose:** Master source of truth for forensic audit, cleanup, architectural correction, rebuild and controlled redevelopment
**Version:** 2.0
**Date:** 2026-09-23

---

## 0. How this document must be used

This document is the **master engineering baseline**, not a UI mockup and not a request to immediately rewrite the application.

The next AI/engineering agent must:

1. Read this entire file before changing code.
2. Audit the real repository before making architectural decisions.
3. Treat repository evidence as authoritative for the current implementation state.
4. Treat this document as the target state and project intent.
5. Never silently invent missing integrations, APIs, credentials, government connectivity, or data sources.
6. Separate **verified facts**, **observations**, **inferences**, **planned architecture**, and **assumptions**.
7. Preserve working functionality unless a change is explicitly justified by the audit.
8. Never perform a broad destructive refactor merely because a cleaner structure is possible.
9. Do not mix the forensic audit with the rebuild. Perform the forensic audit as one continuous, evidence-preserving pass; then produce the rebuild plan; only after review should implementation begin.
10. Every significant change must be traceable to an audit finding, requirement, security issue, UX issue, deployment issue, or official problem-statement requirement.


## 0A. INSTALLED ENGINEERING SKILLS — MANDATORY ORCHESTRATION

The repository was developed/audited with the `agentic-awesome-skills` skill set. Do not treat the skills as optional background knowledge. Invoke the relevant installed skill explicitly for the corresponding audit task.

Confirmed skills from the project workflow:

- `@frontend-design`
- `@react-best-practices`
- `@systematic-debugging`
- `@lint-and-validate`
- `@pre-release-review`
- `@browser-testing-with-devtools`
- `@backend-dev-guidelines`
- `@database-design`
- `@auth-implementation-patterns`
- `@code-review-and-quality`

There are additional installed skills in the local `agentic-awesome-skills` collection. Before starting the audit, enumerate the installed skills and identify the remaining project-relevant skills. Use all relevant skills available in the repository environment rather than pretending a skill was used when it was not.

### Skill invocation rule

Use the agent's supported skill invocation syntax explicitly:

- Preferred: `@skill-name`
- If the Antigravity interface exposes skills through slash commands instead: `/skill-name`

Examples:

`@systematic-debugging`
`@code-review-and-quality`
`@react-best-practices`
`@frontend-design`

Do NOT invoke every skill on every file. Select the skill(s) appropriate to the current evidence and audit domain.

### Mandatory mapping

**Repository/code quality**
- `@code-review-and-quality`
- `@systematic-debugging`
- `@lint-and-validate`

**Frontend/UI/UX**
- `@frontend-design`
- `@react-best-practices`
- `@browser-testing-with-devtools`

**Backend/API**
- `@backend-dev-guidelines`
- `@systematic-debugging`
- `@code-review-and-quality`

**Database/data integrity**
- `@database-design`
- `@code-review-and-quality`

**Authentication/RBAC/security**
- `@auth-implementation-patterns`
- `@backend-dev-guidelines`
- `@systematic-debugging`

**Production/deployment/release**
- `@lint-and-validate`
- `@pre-release-review`
- `@browser-testing-with-devtools`

### Critical rule

A skill invocation is evidence of method, not evidence of correctness. The final audit must still cite repository files, line ranges, runtime observations, test output, and reproducible findings.

If a relevant skill cannot be invoked, record:

`SKILL UNAVAILABLE — continue with equivalent manual audit procedure and document the limitation.`

Do not fabricate skill execution.

---

# 1. Project Mission

The project is an AI-assisted governance platform for detecting anomalies, fraud, collusion, procedural irregularities and execution inefficiencies across the MPLADS implementation lifecycle.

The official SIH problem statement expects coverage of:

- vendor profile, history and report card;
- cross-linking of vendor identity using identifiers such as PAN/GSTIN;
- procurement data across e-Procurement, GeM and CPPP-style sources;
- technical vs non-technical tender verification;
- same-IP / shared-network / multi-vendor participation signals;
- project estimates, work orders, measurements and progress reports;
- physical inspection and geotag/photo verification;
- historical MPLADS fraud and irregularity patterns;
- AI-assisted risk scoring, audit trails and preventive alerts.

The system must therefore be designed as a **preventive decision-support and audit-trace platform**, not merely a dashboard and not merely an ML classifier.

---

# 2. Core Product Principles

## 2.1 Evidence before inference

Every alert, score or recommendation should be traceable to:

- source record(s);
- rule or model feature;
- timestamp;
- confidence/evidence state;
- related project/vendor/tender;
- human review action;
- final disposition.

## 2.2 Risk is not guilt

The system must never present a risk score as proof of fraud or corruption.

Use language such as:

- `Risk Signal`
- `Anomaly Detected`
- `Requires Verification`
- `High-Risk Pattern`
- `Evidence Conflict`
- `Pending Human Review`

Avoid wording that declares criminal liability from an algorithmic score alone.

## 2.3 Auditability by design

All important decisions must have an audit event:

`actor -> action -> object -> old state -> new state -> timestamp -> source -> reason`

## 2.4 Human-in-the-loop

High-impact actions such as payment holds, vendor escalation, project rejection or disciplinary referral must require explicit authorized human action unless the official workflow later establishes a different rule.

## 2.5 Fail closed for security, fail soft for analytics

Security-critical failures should not silently bypass controls.
Analytics failures should degrade gracefully and clearly show the missing data/model status rather than inventing a result.

## 2.6 No fake integrations

If MCA, GSTN, CPPP, GeM, PFMS, e-SAKSHI or other external sources are not actually connected, use a clearly labeled mock/synthetic adapter. Never imply live government integration in the UI or code comments.

---

# 3. Architecture Target State

The exact implementation must be verified against the repository, but the target architecture should be modular and replaceable:

```text
                    ┌──────────────────────────────┐
                    │        React / Vite UI       │
                    │ role-aware dashboards        │
                    └──────────────┬───────────────┘
                                   │
                            API / Auth Layer
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
       Domain Services       AI / Risk Engine       File/OCR Layer
              │                    │                    │
              └──────────────┬─────┴────────────────────┘
                             │
                       Data / Persistence
                             │
                       PostgreSQL/Supabase
                             │
        ┌────────────────────┼────────────────────────────┐
        │                    │                            │
   Audit Events        Project/Tender Data          Vendor Data
        │                    │                            │
        └────────────── External Adapters ────────────────┘
             e-SAKSHI / procurement / GIS / other sources
```

### Required architectural boundaries

- UI components must not directly contain business rules.
- Business rules must not live inside visual components.
- Database queries must be isolated from presentation code.
- External integrations must be adapter-based and mockable.
- AI scoring must be a service/module with deterministic inputs and explainable outputs.
- Authentication and authorization must be centralized.
- Audit logging must be centralized.
- File/OCR processing must be isolated from ordinary CRUD routes.
- Background or expensive operations must not block normal API requests.

---

# 4. Current Stack — What Must Be Verified During Audit

The project discussions indicate a stack involving:

- React
- Vite
- Node.js
- Supabase/PostgreSQL
- Groq-based OCR/LLM functionality
- AI-assisted anomaly/risk logic
- role-specific portal views

These are **project-context expectations**, not permission to assume the repository matches them.

The audit must explicitly verify:

- frontend framework and version;
- build tool and configuration;
- backend runtime and framework;
- database and migration mechanism;
- Supabase usage and RLS policies;
- OCR provider and model usage;
- LLM provider and model usage;
- package versions and abandoned packages;
- environment variable usage;
- hosting/deployment target;
- CI/CD configuration;
- test framework;
- lint/type-check/build commands.

A mismatch between this document and the repo must be recorded in the audit rather than silently reconciled.

---

# 5. Roles and Authorization Model

The application is expected to support distinct workflows rather than one universal dashboard.

Minimum role families to verify and support:

### District Authority

Primary concerns:

- project scrutiny and sanction workflow;
- vendor/project risk overview;
- inspection and evidence review;
- payment/exception review;
- district-level reports;
- escalations;
- audit trail.

### Implementing Agency

Primary concerns:

- assigned projects;
- work orders;
- execution milestones;
- measurements;
- inspection preparation;
- evidence submission;
- completion status;
- vendor/contractor interactions.

### Vendor / Contractor

Primary concerns:

- profile and verification;
- tenders/bids;
- awarded work;
- execution progress;
- evidence/document submission;
- compliance issues;
- report card and explainable risk signals visible according to authorization.

### Additional roles

Any existing admin, super-admin, auditor, citizen/public or reviewer roles must be discovered from the repository and documented in the audit before retaining or redesigning them.

### Authorization rules

Implement authorization as **RBAC + object-level access control** where required.

Never rely on:

- hidden routes;
- hidden sidebar items;
- client-side role checks alone;
- query parameters containing role IDs;
- frontend-only filtering.

Every protected action must be enforced server-side/database-side as appropriate.

---

# 6. Role-Specific UI/UX Baseline (without deciding the future visual theme)

The future color palette and visual theme will be decided separately.

However, these cleanup rules are already mandatory:

### Remove meaningless or placeholder-facing content

Examples include:

- `NIC 2026 Live Server` or similar development/debug labels;
- internal environment names exposed to ordinary users;
- localhost/debug URLs shown in production UI;
- mock credentials or test passwords displayed in production screens;
- meaningless developer labels;
- duplicated status badges;
- generic filler text;
- fake government branding or claims not actually authorized;
- unused widgets/cards that provide no operational value;
- decorative metrics with no source or calculation.

### Role sidebar rule

Do not render one universal sidebar for every role.

Each role must have a deliberate navigation model containing only the modules that role is authorized to use.

### No dashboard theatre

A dashboard must not contain a card just to make the screen look full.
Every KPI must answer an operational question and show its source/time period where relevant.

### UI truthfulness

Never show:

- `Live` unless the data is actually live;
- `Verified` unless verified;
- `Government Integrated` unless the adapter is real;
- `AI Detected Fraud` when the system has only produced an anomaly score.

---

# 7. Domain Model — Target Entities

The audit must identify actual tables/models first. The target domain should normally contain, at minimum:

```text
User
Role
Permission
District
Constituency
MP / Recommender
Project
ProjectRecommendation
ProjectSanction
ProjectStage
ImplementingAgency
Vendor
VendorIdentifier
Tender
Bid
BidParticipant
WorkOrder
MeasurementRecord
Inspection
EvidenceFile
Geotag
Payment
RiskAssessment
RiskSignal
Alert
AuditEvent
Notification
DocumentExtraction
ModelRun
SystemConfiguration
```

The actual schema may differ. The agent must produce a mapping:

`Current entity -> Target entity -> Migration needed -> Risk`

No redundant duplicate tables should survive without a documented reason.

---

# 8. Vendor Risk / Report Card Architecture

The uploaded vendor-risk design defines a **100-point risk score** with four primary vectors:

- Historical Performance / Execution Risk — 35%
- Collusion & Network Risk — 25%
- Financial Anomalies / Pricing Risk — 25%
- Document & Administrative Integrity — 15%

The indicators include delayed completions, abandoned works, physical-inspection failures, blacklisting, shared infrastructure/IP signals, shared directors/addresses, tender rotation, abnormal quoting, single-bidder frequency, irregular GST patterns, measurement-vs-photo discrepancies and bank-account changes near disbursement.

The architecture should implement these as **feature providers**, not one giant scoring function.

Example:

```text
VendorRiskAssessment
  ├── executionRiskProvider
  ├── networkRiskProvider
  ├── pricingRiskProvider
  ├── documentIntegrityProvider
  ├── ruleEngine
  ├── mlEngine
  ├── explanationEngine
  └── evidenceResolver
```

### Risk score requirements

Every score must store:

- model/rule version;
- score timestamp;
- feature values;
- contributing signals;
- thresholds used;
- evidence references;
- data freshness;
- confidence/coverage metadata;
- human override/review history.

### Two-tier risk engine

Retain the original conceptual split:

1. **Rule-based heuristics:** deterministic, immediate controls.
2. **ML layer:** predictive/statistical risk estimation using synthetic or approved historical training data.

Do not fabricate model accuracy numbers. Any example such as “80% chance” must be clearly labeled synthetic/example unless empirically validated.

---

# 9. Fraud / Irregularity Taxonomy

The project research identifies categories including:

- ghost/fictitious works;
- incomplete work certified as complete;
- inflated estimates;
- overbilling/overpayment;
- duplicate billing/double-dipping;
- fake beneficiaries;
- forged documents;
- fabricated photographs;
- tender manipulation/order splitting;
- contractor-official collusion;
- non-permissible works;
- ineligible private-trust diversion;
- payment without physical execution;
- substandard materials;
- disputed/ineligible land;
- conflicts of interest;
- fake measurement-book entries;
- cyber fraud/cheque cloning.

These categories should be represented as structured codes, not free text only.

Example:

```text
RISK_GHOST_WORK
RISK_INCOMPLETE_CERTIFICATION
RISK_COST_INFLATION
RISK_OVERBILLING
RISK_DUPLICATE_ASSET
RISK_FAKE_DOCUMENT
RISK_FAKE_MEDIA
RISK_TENDER_MANIPULATION
RISK_COLLUSION
RISK_NON_PERMISSIBLE_WORK
RISK_PRIVATE_ENTITY_DIVERSION
RISK_UNVERIFIED_PAYMENT
RISK_SUBSTANDARD_EXECUTION
RISK_LAND_ELIGIBILITY
RISK_CONFLICT_OF_INTEREST
RISK_FAKE_MEASUREMENT
RISK_PAYMENT_CHANNEL_ANOMALY
```

---

# 10. Project Lifecycle Pipeline

The system should model the full lifecycle rather than only a final fraud screen:

```text
Recommendation
   ↓
Eligibility / Feasibility
   ↓
Administrative & Technical Sanction
   ↓
Tender / Procurement
   ↓
Vendor Selection
   ↓
Work Order
   ↓
Execution
   ↓
Measurement / Progress Evidence
   ↓
Physical Inspection
   ↓
Completion Certification
   ↓
Payment / Disbursement
   ↓
Handover / O&M
   ↓
Audit / Closure
```

Each stage should have:

- entry conditions;
- authorized actors;
- required evidence;
- validations;
- anomaly checks;
- state transition rules;
- exception states;
- audit events;
- rollback/compensation behavior where applicable.

---

# 11. Core Detection Controls

The target system should support, subject to actual data availability:

### Vendor

- repeated delays;
- abandonment/termination history;
- inspection failure rate;
- blacklisting;
- sudden bank mapping changes;
- identity overlap;
- repeated single-bid wins;
- abnormal price behavior;
- tender rotation;
- inconsistent corporate/GST profile.

### Procurement

- shared IP/network signals;
- common device/network metadata;
- corporate ownership overlap;
- repeated bidder clusters;
- suspicious bid timing;
- repeated L1 rotation;
- unusually low or unusually high quotations;
- work-order fragmentation.

### Project

- duplicate location;
- duplicate asset;
- duplicate work description;
- same contractor concentration;
- cost escalation;
- repeated amendments;
- suspicious timeline compression;
- delayed execution;
- payment before verified milestone.

### Evidence

- photo reuse;
- geotag mismatch;
- timestamp anomalies;
- image/document duplication;
- OCR mismatch;
- measurement-book vs photo contradiction;
- missing supporting documents;
- document metadata inconsistencies.

---

# 12. AI / OCR / LLM Rules

The system may use OCR/LLMs for extraction and interpretation, but deterministic validations must remain outside the LLM wherever practical.

### OCR pipeline

```text
Upload
 → file validation
 → malware/type/size validation
 → OCR
 → field extraction
 → schema validation
 → confidence calculation
 → human review when confidence is low
 → persistence
```

### LLM usage rules

LLMs may assist with:

- document summarization;
- structured extraction;
- anomaly explanation;
- report drafting;
- natural-language querying of approved internal data.

LLMs must not silently:

- invent project facts;
- modify financial records;
- approve payments;
- change permissions;
- mark a project fraud-confirmed;
- override audit state;
- manufacture citations.

### Prompt/data isolation

Never mix sensitive credentials, secrets or unrestricted database dumps into prompts.
Use least-privilege retrieval and redact data unnecessary for the task.

---

# 13. Database & Supabase Requirements

If Supabase/PostgreSQL is confirmed in the repository:

- use migrations as source of truth;
- no manual production schema drift;
- enforce RLS for tenant/role-sensitive data;
- document every policy;
- avoid broad service-role exposure;
- keep service-role keys server-side only;
- index high-frequency filters and joins;
- use foreign keys and sensible constraints;
- avoid duplicated denormalized state unless justified;
- record created/updated timestamps;
- use immutable audit-event rows;
- define deletion/retention policy for documents and evidence.

The audit must specifically look for:

- tables with no RLS;
- permissive `USING (true)` / `WITH CHECK (true)` policies where inappropriate;
- client-exposed secrets;
- direct table access that bypasses business authorization;
- orphan rows;
- inconsistent IDs;
- missing uniqueness constraints;
- unbounded queries;
- N+1 data fetching.

---

# 14. API / Backend Engineering Rules

Every domain route should have:

- input validation;
- authentication;
- authorization;
- business validation;
- predictable response shape;
- structured errors;
- audit logging when state changes;
- rate limiting where relevant;
- idempotency for critical operations where possible.

Do not put complex business logic directly in HTTP handlers.

Preferred separation:

```text
Route / Controller
      ↓
Validation
      ↓
Authorization
      ↓
Domain Service
      ↓
Repository / Database Adapter
      ↓
Audit Event
```

---

# 15. Error Handling & Exception Strategy

Use typed/structured error classes or a consistent error schema.

Minimum categories:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
EXTERNAL_SERVICE_ERROR
OCR_ERROR
MODEL_ERROR
DATABASE_ERROR
FILE_PROCESSING_ERROR
INTEGRATION_UNAVAILABLE
INTERNAL_ERROR
```

The frontend must not display raw stack traces, SQL errors, environment paths or provider secrets.

Every external dependency should have:

- timeout;
- retry policy where safe;
- retry limits;
- circuit-breaker/degradation strategy where needed;
- clear user-facing fallback;
- structured logs.

---

# 16. Security Baseline

The forensic audit must explicitly inspect:

- secrets in repository history;
- `.env` handling;
- hard-coded API keys;
- JWT/session storage;
- role escalation paths;
- insecure direct object references;
- file upload vulnerabilities;
- path traversal;
- SQL injection;
- XSS;
- CSRF where applicable;
- SSRF;
- weak password handling;
- overly broad CORS;
- verbose production errors;
- insecure webhook handling;
- unsafe dependency versions;
- exposed debug endpoints;
- service-role leakage;
- insecure signed URLs;
- missing rate limits on auth/OCR/LLM endpoints.

Security findings must receive severity and exploitability notes.

---

# 17. File & Document Storage

Evidence files can include PDFs, images, spreadsheets and scanned records.

Every stored file should have:

- owner/context;
- content type;
- size;
- checksum/hash when useful;
- upload timestamp;
- source;
- processing state;
- OCR state;
- verification state.

Never trust filename or client-provided MIME type as the only validation.

---

# 18. Observability

Production-grade minimum:

- structured server logs;
- request correlation ID;
- audit event ID;
- error reporting;
- health endpoint;
- readiness/liveness distinction where relevant;
- AI/OCR processing status;
- external dependency health;
- latency metrics for key operations.

Logs must not contain passwords, API keys, tokens or unnecessary personal data.

---

# 19. Deployment & Release Requirements

Before any deployment, the audit must establish:

- exact build command;
- exact production start command;
- environment variables required;
- environment variables optional;
- database migration command;
- seed/mock-data command;
- health-check endpoint;
- supported Node/runtime version;
- frontend hosting requirements;
- backend hosting requirements;
- storage requirements;
- external API dependencies;
- CORS configuration;
- production build size;
- source-map policy;
- rollback procedure.

### Deployment blockers

The following should block release unless explicitly accepted:

- build fails;
- lint/type-check fails on production path;
- missing critical env variables;
- insecure secrets committed;
- database migrations fail;
- auth bypass exists;
- production UI contains developer/debug content;
- critical API errors are unhandled;
- broken role isolation;
- placeholder or fake live integrations are exposed as real.

---

# 20. Codebase Cleanup Rules

During the forensic audit, classify every questionable file into one of:

- `KEEP_ACTIVE`
- `KEEP_BUT_REFACTOR`
- `KEEP_LEGACY`
- `DUPLICATE`
- `UNUSED`
- `TEMPORARY`
- `MOCK_ONLY`
- `GENERATED`
- `DEPLOYMENT_RISK`
- `UNKNOWN_NEEDS_VERIFICATION`

Never delete an `UNKNOWN_NEEDS_VERIFICATION` file merely because it looks unused.

### Identify and report

- dead components;
- duplicate components;
- duplicate hooks;
- duplicate API clients;
- duplicated utilities;
- unused imports;
- unused dependencies;
- abandoned routes;
- old auth systems;
- old database helpers;
- stale mock data;
- obsolete documentation;
- multiple conflicting config files;
- generated files accidentally committed;
- debug scripts;
- hard-coded test accounts;
- legacy CSS/themes;
- obsolete screenshots/assets;
- redundant environment files;
- duplicate schema definitions.

### Documentation cleanup

Old architecture/design/docs files must not remain as competing sources of truth.
The audit should inventory them first. During the rebuild, consolidate authoritative documentation under the new `/docs` structure defined below.

---

# 21. Required Documentation Structure After the Audit

The old scattered markdown files should be replaced by a coherent documentation tree.

Recommended target:

```text
/docs
  00_PROJECT_OVERVIEW.md
  01_REQUIREMENTS_AND_SCOPE.md
  02_ARCHITECTURE.md
  03_SYSTEM_PIPELINE.md
  04_DOMAIN_MODEL.md
  05_DATABASE.md
  06_API_CONTRACTS.md
  07_AUTH_RBAC.md
  08_VENDOR_RISK_ENGINE.md
  09_AI_OCR_LLM_PIPELINE.md
  10_FRAUD_TAXONOMY.md
  11_EXTERNAL_INTEGRATIONS.md
  12_SECURITY.md
  13_ERROR_HANDLING.md
  14_OBSERVABILITY.md
  15_TESTING_QA.md
  16_DEPLOYMENT.md
  17_DATA_SEEDING.md
  18_MOCK_DATA_AND_DEMO.md
  19_UI_ROLE_MAP.md
  20_CHANGELOG.md
  21_KNOWN_LIMITATIONS.md
  22_AUDIT_FINDINGS.md
  23_REBUILD_PLAN.md
  24_DECISION_LOG.md
  25_TRACEABILITY_MATRIX.md
```

Only create documents that are actually required; do not create empty documentation files just to satisfy the list.

---

# 22. Master Traceability Requirement

Every major SIH requirement must map to:

`Requirement -> UI/module -> API -> database entity -> detection/rule -> audit event -> test`

For example:

```text
Same-IP vendor participation
 → Procurement Analytics
 → /api/tenders/:id/risk
 → BidParticipant / VendorNetwork
 → SharedIPRule
 → RiskAssessment + AuditEvent
 → unit + integration + seeded demo test
```

---

# 23. Testing Strategy

Testing must be layered:

### Unit tests

- scoring functions;
- risk rules;
- validators;
- authorization predicates;
- data transformations;
- document extraction normalization.

### Integration tests

- auth + RBAC;
- API + DB;
- file upload + OCR;
- risk pipeline;
- payment/hold state transitions;
- audit logging.

### End-to-end tests

At least cover the main flows for each confirmed role:

- login;
- navigation;
- project workflow;
- vendor workflow;
- inspection workflow;
- risk review;
- evidence submission;
- logout/session expiry.

### Release validation

Run at minimum:

```text
install
lint
typecheck
unit tests
integration tests
build
smoke test
security checks
```

Commands must come from the actual repository; do not invent them.

---

# 24. Demo / Hackathon Reliability Rules

The demo must work even when external government APIs are unavailable.

Use adapter interfaces such as:

```text
GovernmentDataProvider
ProcurementDataProvider
VendorRegistryProvider
GISProvider
OCRProvider
RiskFeatureProvider
```

Implement a `Mock*Provider` for demo mode, but label it clearly as simulated data.

The demo should support a deterministic seeded scenario showing:

1. vendor registration;
2. vendor risk profile;
3. suspicious tender network;
4. project execution;
5. evidence mismatch;
6. generated risk signals;
7. human review;
8. audit trail;
9. final resolution.

---

# 25. UI Integrity Rules for the Rebuild

Detailed visual design is intentionally deferred.

Until the visual system is redesigned, the following are non-negotiable:

- consistent information hierarchy;
- no broken responsive layouts;
- no horizontal overflow on normal screens;
- no role-inappropriate navigation;
- no duplicated headers;
- no placeholder text;
- no fake live indicators;
- no development labels;
- clear loading states;
- clear empty states;
- clear error states;
- accessible form labels;
- keyboard-navigable critical workflows;
- predictable button hierarchy;
- readable tables and filters;
- visible last-updated/source context for operational metrics.

---

# 26. What the Forensic Audit Must NOT Do

During the audit phase:

- do not rewrite the entire codebase;
- do not delete large directories without evidence;
- do not change the database schema merely for aesthetics;
- do not change API contracts without documenting the impact;
- do not replace working libraries because a different library is fashionable;
- do not introduce a new framework unless justified;
- do not add speculative integrations;
- do not add unnecessary dependencies;
- do not redesign the color theme yet;
- do not remove functionality merely because it is imperfect;
- do not call an allegation a fact;
- do not label a vendor/project as fraudulent solely from AI output.

---

# 27. Three-Day Forensic Audit Model

## audit phase — Repository & Architecture Forensics

Goal: establish exactly what exists.

Deliverables:

- complete file inventory;
- framework/runtime inventory;
- route inventory;
- component inventory;
- dependency graph summary;
- environment/config inventory;
- database/schema/RLS map;
- auth/RBAC map;
- API map;
- external integration map;
- build/lint/test baseline;
- obsolete/duplicate/dead-code candidates;
- immediate deployment blockers.

No rebuild yet.

## verification phase — Business Logic, Data Pipeline & Security Forensics

Goal: understand whether the implementation actually matches the problem and architecture.

Inspect:

- project lifecycle;
- vendor risk pipeline;
- fraud rules;
- OCR/LLM flow;
- payment/hold logic;
- evidence/inspection flow;
- procurement logic;
- role isolation;
- database integrity;
- RLS/authentication;
- error handling;
- external API failures;
- data leakage;
- logging/auditability;
- performance hotspots;
- dependency risks.

Output a prioritized defect register with evidence and code locations.

## finalization phase — Deployment, UX Integrity & Rebuild Blueprint

Goal: determine what must be fixed before production/hackathon submission.

Inspect:

- production build;
- environment requirements;
- deployment scripts;
- runtime compatibility;
- failed routes/screens;
- role-specific UI consistency;
- junk/debug UI;
- accessibility basics;
- responsive failures;
- API reliability;
- demo-data reliability;
- release risks;
- final architecture gaps.

Then create the rebuild plan, sequencing changes from highest risk to lowest risk.

---

# 28. Audit Finding Format

Every significant finding should use this structure:

```text
ID: AUD-###
Severity: BLOCKER / CRITICAL / HIGH / MEDIUM / LOW
Category: Architecture / Security / Logic / Data / UI / Deployment / Performance / Documentation
Location: exact file + line/range where possible
Observed: what the code currently does
Expected: what should happen
Impact: why it matters
Evidence: exact code/config/test output
Root Cause: likely underlying cause
Recommendation: precise fix
Dependencies: other fixes required first
Regression Risk: Low / Medium / High
Verification: exact test/check to prove resolution
Status: Open / Accepted / Fixed / Deferred / Rejected
```

Do not write vague findings such as “code can be improved.”

---

# 29. Severity Model

### BLOCKER
Prevents deployment, corrupts data, bypasses authorization, exposes critical secrets, or breaks the core demo.

### CRITICAL
Major security, financial, data-integrity or lifecycle failure likely to cause incorrect decisions or system compromise.

### HIGH
Important feature is broken, unreliable, materially inconsistent with requirements, or produces misleading results.

### MEDIUM
Significant maintainability, UX, performance or correctness issue that does not immediately invalidate the system.

### LOW
Cleanup, refactor, polish or minor consistency issue.

---

# 30. Definition of “Ready to Rebuild”

Do not start broad redevelopment until the audit establishes:

- current stack;
- current routes;
- current role matrix;
- current database schema;
- current API contracts;
- current risk engine;
- current data flow;
- current deployment path;
- current critical bugs;
- redundant/obsolete files;
- high-risk security findings;
- explicit rebuild priorities.

---

# 31. Definition of “Ready for Deployment”

The rebuilt project should satisfy:

- reproducible clean install;
- reproducible build;
- working authentication and RBAC;
- role-correct navigation;
- validated database migrations;
- validated API contracts;
- structured errors;
- audit logging;
- no exposed secrets;
- working risk engine with explainable outputs;
- deterministic demo dataset;
- no fake production claims;
- no obvious debug/developer UI;
- documented environment variables;
- documented rollback/recovery path;
- smoke test pass;
- release checklist signed off.

---

# 32. Important Source Baseline

This project context is grounded in the supplied SIH problem statement, MPLADS forensic research, 20-year MPLADS study, and vendor-risk technical design.

The official problem statement emphasizes vendor profiling, procurement-platform integration, shared-IP/collusion detection, project measurement and progress evidence, physical inspection/geotagging, historical fraud patterns, and AI benchmarking such as Brazil's ALICE system.

The supplied vendor-risk design specifies the four-vector 35/25/25/15 weighting architecture and a two-tier rule + ML implementation.

The supplied forensic research identifies repeated risk mechanisms including ghost works, false/incomplete certification, duplicate claims, tender manipulation, forged documents, non-permissible works, fake measurements and payment-channel fraud.

Where these source documents contain claims that are not independently verified inside the repository, they must be treated as **research/context**, not as runtime facts.

---

# 33. Final Instruction to the Next Engineering Agent

**Audit first. Do not guess. Do not rebuild blindly.**

The correct sequence is:

```text
READ MASTER GUIDELINES
        ↓
INSPECT ENTIRE REPOSITORY
        ↓
ESTABLISH VERIFIED CURRENT STATE
        ↓
GENERATE FORENSIC AUDIT
        ↓
CLASSIFY BLOCKERS / DEBT / REDUNDANCY
        ↓
FREEZE A CLEAN TARGET ARCHITECTURE
        ↓
CREATE NEW AUTHORITATIVE /docs SET
        ↓
REBUILD IN CONTROLLED PHASES
        ↓
TEST EACH PHASE
        ↓
RUN PRE-RELEASE AUDIT
        ↓
DEPLOY
```

No shortcut that skips repository-level verification should be considered a valid implementation plan.


---

# 30. Audit Execution Model — ONE CONTINUOUS PASS

The forensic audit is **not** a multi-day sequence.

Any previous wording describing the audit as three separate days must be treated as organizational shorthand only and must not cause the agent to stop after an artificial daily boundary.

The agent should execute the complete audit **in one continuous run**, subject to tool/runtime limits.

The required order is:

1. Read this document completely.
2. Enumerate and invoke relevant engineering skills.
3. Inventory the repository.
4. Establish the actual technology/runtime baseline.
5. Trace frontend → backend → database → external services.
6. Audit authentication/RBAC.
7. Audit AI/OCR/risk/fraud pipelines.
8. Audit data integrity and mock/synthetic data.
9. Audit UI/UX and browser behavior.
10. Audit security, dependencies, build and deployment.
11. Reconcile old documentation against actual code.
12. Produce the complete forensic findings.
13. Produce the rebuild/migration specification.
14. Produce the authoritative documentation structure.

Do not artificially divide these activities into "audit phase", "verification phase" and "finalization phase".

## SKILL ORCHESTRATION, CONTEXT EFFICIENCY & TOKEN DISCIPLINE

Use the confirmed Antigravity invocation mechanism: `@skill-name`.

### Core skills

Load and use these core skills for the corresponding audit areas:

- `@context-window-management` — context compression, checkpointing, deduplication, and efficient inspection.
- `@concise-planning` — compact execution planning; avoid verbose intermediate plans.
- `@systematic-debugging` — root-cause analysis and failure-path investigation.
- `@frontend-design` — production UI structure, hierarchy, polish, accessibility-facing issues.
- `@react-best-practices` — React architecture, rendering, hooks, state, and maintainability.
- `@backend-dev-guidelines` — backend/API structure, validation, services, error handling.
- `@database-design` — schema, relations, constraints, indexes, migrations, integrity.
- `@auth-implementation-patterns` — authentication, authorization, RBAC, sessions/tokens, privilege boundaries.
- `@code-review-and-quality` — correctness, maintainability, duplication, technical debt.
- `@browser-testing-with-devtools` — runtime/browser, console, network, responsive and interaction verification.
- `@lint-and-validate` — lint, type/build checks, static validation.
- `@pre-release-review` — release/deployment readiness and blockers.
- `@deploy-to-vercel` — deployment configuration only where relevant.

### Conditional specialist skills

Load these only when the repository contains relevant scope:

`@bug-hunter` `@api-analyzer` `@sast-scanning` `@pentest-checklist`
`@react-component-performance` `@react-patterns` `@domain-modeling`
`@playwright-skill` `@ui-ux-pro-max` `@indexing-issue-auditor`
`@planning-with-files` `@antigravity-design-expert`

### Rules

1. Load a skill before claiming it was used.
2. Use the smallest sufficient skill set for each audit area.
3. Do not activate irrelevant skills merely because they exist.
4. Do not repeatedly reload the same skill.
5. Do not paste entire `SKILL.md` files into context unless necessary.
6. Search first and inspect only relevant files, symbols, routes, handlers, schemas, and configurations.
7. Reuse findings across sections instead of re-reading the same code.
8. Maintain compact checkpoints/summaries as major subsystems are completed.
9. Cross-reference repeated evidence by finding ID rather than duplicating it.
10. Keep intermediate output concise; preserve detailed evidence in the final `/docs` artifacts.
11. Do not reduce audit coverage to save tokens; reduce redundant context and repeated inspection.
12. If a skill cannot be loaded, record `SKILL UNAVAILABLE` and continue with the appropriate manual methodology.

## ONE-CONTINUOUS-PASS EXECUTION

Execute the audit as one continuous repository audit workflow.

Do not divide execution into “Day 1”, “Day 2”, “Day 3”, or any calendar/day-based plan. Logical stages and checkpoints are allowed inside the single continuous audit, but they are not separate days or separate audit engagements.

Do not stop after an initial scan. Continue through repository inventory, architecture, frontend, backend, database, authentication/RBAC, APIs, AI/OCR/vendor-risk, fraud detection pipeline, UI/UX, browser/runtime behavior, security, dependencies, testing, deployment, data integrity, documentation, dead code, technical debt, and rebuild requirements.
