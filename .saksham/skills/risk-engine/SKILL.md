---
name: risk-engine-skill
description: Skill instructions for SAKSHAM multi-dimensional risk scoring, weight normalization, and anomaly detection.
---

# Risk Engine Skill

## Purpose
Maintains the mathematical integrity and deterministic execution of the six segregated risk dimensions (Vendor, Tender, Project, Inspection, Payment, Document) and composite index calculation.

## Rules
- Keep risk dimensions segregated and unpolluted.
- All scoring must produce deterministic, reproducible numerical values [0.0 - 100.0].
- Every calculated signal must attach an explanation rationale.
