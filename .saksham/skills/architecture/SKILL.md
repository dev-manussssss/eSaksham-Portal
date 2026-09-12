---
name: architecture-skill
description: Skill instructions for validating SAKSHAM architectural boundaries, persistence guarantees, and data flow.
---

# Architecture Skill

## Purpose
Guides architectural reviews to ensure SAKSHAM strictly acts as an assistive monitoring layer around e-SAKSHI without replacing it or mutating transactional state unsafely.

## Invariants to Enforce
1. Backend/DB is the sole source of truth.
2. Completed AI analysis must never restart on page refresh.
3. Every risk indicator must be explainable and evidence-linked.
4. AI services must degrade gracefully without fabricating dummy scores.
