# AGENTS.md — SAKSHAM Development & Operational Agent Guidelines

## 1. System Identity & Mission

**SAKSHAM** is an intelligence, monitoring, anomaly-detection, and risk-analysis platform built around the Members of Parliament Local Area Development Scheme (MPLADS) and the operational e-SAKSHI ecosystem.

> **CRITICAL RULE**: SAKSHAM does **NOT** replace e-SAKSHI. It acts as an intelligence, risk analysis, and decision-support layer surrounding it. SAKSHAM recommends, flags anomalies, scores risks, and alerts. Human administrative officers (District Authorities, Nodal Officers, Engineers) remain exclusively responsible for all administrative sanctions, statutory approvals, vendor payments, and punitive actions.

---

## 2. Mandatory Architectural Constraints

Every autonomous agent, developer, and code generator contributing to SAKSHAM must uphold the following core principles:

1. **Backend / Database as Source of Truth**:
   - The frontend is strictly a presentation and interaction layer. It must never store authoritative state or compute risk metrics locally.
   - All state mutations, analytical evaluations, and risk scoring must be recorded and verified in the database.
2. **State Persistence Across Refreshes and Sessions**:
   - Refreshing a browser tab or switching devices must retain identical investigation states, filters, evidence linkages, and scores.
   - Authorized users across multiple devices must see identical, synchronized records.
3. **Deterministic & Cached AI Execution**:
   - Once an AI/ML/CV/OCR analysis pipeline runs for a specific entity version (document hash, photo set, tender ID), the resulting analysis is versioned and persisted.
   - Completed AI analysis **must never restart or re-trigger** on page refresh.
   - If AI microservices or external models become unavailable, pre-computed historical results and deterministic rules engines must remain fully available.
4. **Graceful Degradation & Zero Fabrication**:
   - Never fabricate or mock missing AI responses when a service is offline.
   - Mark signals clearly as `ANALYSIS_PENDING`, `SERVICE_UNAVAILABLE`, or `INCONCLUSIVE`.
   - AI outputs must never autonomously block official government administrative actions.
5. **Separation of Risk Dimensions**:
   - Independent risk pipelines must be maintained separately:
     - `Vendor Risk` (longitudinal performance, blacklisting history, shell indicators, load saturation)
     - `Tender Risk` (bid-rigging, cartel formation, single-bidder repetition, split works)
     - `Project Risk` (physical progress delay, milestone stalling, cost variance)
     - `Inspection Risk` (unverified photos, geo-spoofing, stale imagery, template reuse)
     - `Payment Risk` (advance payments exceeding guidelines, payment ahead of physical stage)
     - `Document Intelligence / OCR Risk` (tampered MB records, invoice mismatch, fake GSTINs)
   - A `Composite Investigation Risk` combines these dimensions using explainable, weighted, evidence-linked scoring.
6. **Explainability & Evidence Linking**:
   - Every risk score or anomaly flag must link directly to primary evidence artifacts (UUID-linked document page, pixel coordinates, geospatial polygon deviation, or bid-timestamp overlap).
   - Unexplainable "black-box" risk numbers are strictly prohibited.

---

## 3. Frontend Principles & Guardrails

- **Aesthetics & Identity**:
   - Clean, modern, high-contrast, government-grade utility interface.
   - Primary palette: Official deep navy / sapphire blue (`#0A3871`, `#1E40AF`) with clean crisp white and neutral slate backgrounds.
   - Restrained semantic risk accents: Low (Emerald `#059669`), Moderate (Amber `#D97706`), High (Rose/Crimson `#DC2626`).
- **Operational Workflow Preservation**:
   - Maintain the operational stages familiar to district authorities (Recommendation -> Sanction -> Tendering -> Implementation -> Inspection -> Completion -> Asset Handover).
   - Modernize ergonomics and legibility without disorienting administrative users.
- **Strict Anti-Hallucination UI Rules**:
   - **Never invent** arbitrary version tags (e.g., "V2", "V3", "Version 2", "SIH 2026", "SIH Edition").
   - **Never invent** non-existent government ministries, fictional portals, or unauthorized national seals.
   - **Never create** decorative dummy cards, fake statistical metrics, or filler text ("Lorem Ipsum"). Every widget must represent concrete domain data.

---

## 4. Code & Implementation Standards

- **Simplicity & Readability**: Prefer small, single-responsibility functions over complex meta-programming or deeply nested abstractions.
- **Defensive API Contracts**: Use explicit schema definitions (e.g., Pydantic / TypeScript types) for all domain entities.
- **Documentation Over Decoration**: Comments must state *why* a business or statutory rule exists (e.g., citation of MPLADS Scheme Guidelines clause on split sanctions), not obvious implementation mechanics.
- **No Premature Feature Creep**: Do not add dependencies, heavy ML libraries, or boilerplate scaffolding without explicit operational requirement.

---

## 5. Agent Operational Roles

| Skill Directory | Focus Domain | Primary Responsibility |
| :--- | :--- | :--- |
| `.saksham/skills/architecture` | Core System Architecture | Validates adherence to data persistence, service boundaries, and state truth. |
| `.saksham/skills/backend` | API & Domain Logic | Implements resilient REST/RPC endpoints, auditing, and business validation. |
| `.saksham/skills/frontend` | UI / UX Presentation | Builds responsive, mobile-first, zero-clutter interfaces with semantic styling. |
| `.saksham/skills/database` | Schema & Migrations | Manages relational schemas, versioned audit logs, indexes, and graph mappings. |
| `.saksham/skills/risk-engine` | Multi-Factor Risk Scoring | Maintains deterministic rule sets and composite risk aggregation algorithms. |
| `.saksham/skills/fraud-graph` | Entity Relationship Graphs | Detects cartels, shared director DINs, common phone/PAN/bank hashes, and circular bidding. |
| `.saksham/skills/ocr` | Document Intelligence | Extracts structured data from Measurement Books (MB), invoices, and sanction orders. |
| `.saksham/skills/computer-vision` | Visual Progress Verification | Analyzes geo-tagged site imagery for structural milestones and duplicate image detection. |
| `.saksham/skills/geospatial` | Location & Cadastral Verification| Detects GPS spoofing, verifies project coordinates within constituency boundaries. |
| `.saksham/skills/llm` | Explainable AI & Summaries | Generates transparent, citation-backed investigative audit briefings for nodal officers. |
| `.saksham/skills/testing` | Quality Assurance | Enforces integration tests, deterministic risk checks, and offline degradation tests. |
| `.saksham/skills/docker` | Container Scaffolding | Defines reproducible development and production orchestration environments. |
| `.saksham/skills/security` | Access Control & Integrity | Guards role-based permissions (RBAC), tamper-evident audit trails, and data safety. |
| `.saksham/skills/documentation` | Technical Documentation | Keeps architecture specifications, schemas, and operator guides up to date. |
