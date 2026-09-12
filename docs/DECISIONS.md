# Architectural Decision Records (ADR) — SAKSHAM

## ADR-001: Separation of Intelligence Layer from e-SAKSHI Operational Core

- **Status**: APPROVED
- **Context**: e-SAKSHI is the official transactional platform for MPLADS. Modifying e-SAKSHI source directly or replacing its transactional database would violate administrative mandates and introduce high operational risk.
- **Decision**: SAKSHAM is strictly decoupled as an intelligence, risk monitoring, and decision-support overlay. It ingests data read-only and outputs alerts and evidence dossiers for officers.
- **Consequences**: Zero risk of corrupting official transactional records; administrative authority remains 100% human-driven.

---

## ADR-002: Deterministic Caching and Zero Re-execution on Refresh

- **Status**: APPROVED
- **Context**: Running complex neural networks (OCR, image classification, graph clustering) every time a district officer opens or refreshes a dashboard causes server resource exhaustion, unpredictable UI delays, and potential non-deterministic score drift.
- **Decision**: All analytical outputs are versioned and stored in the database keyed by content hash. The frontend strictly renders persisted records. Completed analysis never re-runs on page refresh.
- **Consequences**: Instantaneous page loads, predictable resource utilization, reproducible audit trails.

---

## ADR-003: Graceful Degradation Without Synthetic Fabrication

- **Status**: APPROVED
- **Context**: If external ML services or image processors experience downtime, naive systems might fall back to dummy or random scores, severely compromising legal evidence standards.
- **Decision**: SAKSHAM forbids synthetic score fabrication. If a service is down, the system marks the signal as `SERVICE_UNAVAILABLE` / `PENDING_ANALYSIS` and provides transparent notices.
- **Consequences**: Absolute legal defensibility of all presented evidence in statutory investigations.

---

## ADR-004: Strict Anti-Hallucination Labeling and Aesthetic Standards

- **Status**: APPROVED
- **Context**: Hackathon or prototype artifacts frequently introduce fake logos, arbitrary version badges ("V2", "V3"), or decorative clutter that impairs usability in real district administrations.
- **Decision**: Ban decorative cards, fake statistics, fabricated versioning, and unofficial seals. Maintain an official, restrained deep navy and white aesthetic with semantic risk accents.
- **Consequences**: Professional, institutional credibility and alignment with national e-governance design standards.
