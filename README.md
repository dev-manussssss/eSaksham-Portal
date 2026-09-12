# SAKSHAM — MPLADS Intelligence & Risk Monitoring Platform

## Executive Overview

**SAKSHAM** is an enterprise-grade intelligence, anomaly-detection, and risk-monitoring platform designed to wrap around the **MPLADS** (Members of Parliament Local Area Development Scheme) and operational **e-SAKSHI** ecosystem.

The system empowers District Authorities, Nodal Officers, State Planning Departments, and Central Monitors with proactive, evidence-linked risk insights, preventing leakage, cartelization, duplicate funding, ghost assets, and substandard execution across parliamentary constituency works.

> **IMPORTANT STATUTORY DIRECTIVE**:
> SAKSHAM is an assistive intelligence layer. It **does not replace e-SAKSHI** and **does not autonomously execute administrative or financial actions**. Administrative accountability remains strictly with designated government officers.

---

## Key Capabilities

1. **Vendor Risk Monitoring**: Longitudinal tracking of vendor delivery history, capacity saturation, blacklisting history across states, and consortium integrity.
2. **Tender & Procurement Risk**: Detection of bid-rigging rings, cover bidding, cartel formations, synchronized bidding times, and split tenders designed to bypass statutory sanction ceilings.
3. **Project & Execution Risk**: Discrepancy detection between financial releases, measured work, and scheduled milestones.
4. **Document Intelligence (OCR)**: Digitization and cross-verification of contractor bills, Measurement Book (MB) recordings, sanction letters, and GST vouchers against national databases.
5. **Computer Vision & Visual Evidence**: Detection of reused/stock photographs, digital tamper indicators, and computer vision classification of construction stage completion.
6. **Geospatial & Cadastral Verification**: GPS coordinate boundary validation against official constituency maps, elevation check, and detection of fictitious project locations.
7. **Fraud Relationship Graph**: Entity-resolution graph correlating shared directors, phone numbers, bank accounts, and physical addresses across ostensibly competing entities.
8. **Explainable AI Dossiers**: Structured investigative summaries linking every anomaly directly to verifiable, immutable evidence records.

---

## Architectural Principles

- **Database as Ground Truth**: The backend database maintains authoritative state. Client applications serve strictly as responsive, accessible viewing and decision-support terminals.
- **Persistence Across Sessions**: All investigations, risk evaluations, and officer annotations persist deterministically across page reloads and user sessions.
- **Degradation with Zero Fabrication**: If specialized ML/OCR services become unavailable, the system transparently indicates analytical status without ever inventing synthetic scores.
- **Explainability First**: Every risk badge or indicator provides a direct drill-down into specific documentary, spatial, or mathematical evidence.

---

## Repository Layout

```text
.
├── AGENTS.md                  # Development principles, system constraints & agent behaviors
├── README.md                  # Project overview, capabilities, and repository structure
├── docs/                      # Comprehensive technical and operational architecture documentation
│   ├── ARCHITECTURE.md
│   ├── SYSTEM_OVERVIEW.md
│   ├── USER_ROLES.md
│   ├── WORKFLOWS.md
│   ├── DATA_ARCHITECTURE.md
│   ├── API_ARCHITECTURE.md
│   ├── AI_ARCHITECTURE.md
│   ├── RISK_ENGINE.md
│   ├── FRAUD_GRAPH.md
│   ├── OCR_DOCUMENT_INTELLIGENCE.md
│   ├── COMPUTER_VISION.md
│   ├── GEOLOCATION_VERIFICATION.md
│   ├── INVESTIGATION_SYSTEM.md
│   ├── PERSISTENCE_AND_STATE.md
│   ├── ERROR_HANDLING.md
│   ├── SECURITY.md
│   ├── AUTHENTICATION_AND_AUTHORIZATION.md
│   ├── FRONTEND_GUIDELINES.md
│   ├── DESIGN_SYSTEM.md
│   ├── DEMO_MODE.md
│   ├── MOCK_DATA.md
│   ├── TESTING.md
│   ├── DOCKER.md
│   ├── DEPLOYMENT.md
│   ├── MCP_SETUP.md
│   └── DECISIONS.md
├── config/                    # Configuration schemas, UI content dictionaries, and environment templates
│   ├── ui-content/
│   ├── application/
│   └── environments/
├── frontend/                  # Modern, mobile-first responsive presentation layer (e-SAKSHI visual alignment)
├── backend/                   # Core API services, orchestration layer, and administrative workflows
├── services/                  # Specialized intelligence and analytical microservices
│   ├── risk-engine/
│   ├── fraud-graph/
│   ├── ocr-service/
│   ├── cv-service/
│   └── llm-service/
├── database/                  # Schema definitions, migrations, relational tables, and graph projections
├── tests/                     # Automated unit, integration, and risk-determinism test suites
├── docker/                    # Multi-container orchestration, compose definitions, and Dockerfiles
└── .saksham/
    └── skills/                # Modular agent skill definitions covering each domain layer
```

---

## Getting Started

Consult the targeted documentation in the [`docs/`](docs/) directory:
- System overview and statutory context: [`docs/SYSTEM_OVERVIEW.md`](docs/SYSTEM_OVERVIEW.md)
- Complete technical architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- User role definitions & permissions: [`docs/USER_ROLES.md`](docs/USER_ROLES.md)
- Engineering and design guidelines: [`docs/FRONTEND_GUIDELINES.md`](docs/FRONTEND_GUIDELINES.md) & [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
