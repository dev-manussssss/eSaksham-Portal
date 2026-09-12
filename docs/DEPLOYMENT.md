# Deployment Guidelines — SAKSHAM

## 1. Hosting Topologies

SAKSHAM supports two primary deployment topologies:
1. **Air-Gapped / On-Premise Government Data Centers (NIC / SDC)**:
   - Zero external public internet egress.
   - Local registry for container images.
   - Self-contained open-source models (Tesseract OCR, PyTorch models quantized for CPU execution).
2. **Dedicated Government Cloud (MeitY-Empaneled Cloud)**:
   - High-availability multi-zone deployment.
   - Managed PostgreSQL / PostGIS database.
   - Dedicated GPU worker nodes for batch OCR and CV processing.

---

## 2. Zero-Downtime Deployment Invariants

1. **Forward-Compatible Database Migrations**:
   - Column additions and index creations must execute concurrently without locking transactional tables.
   - Column deprecations require a three-step phased rollout (add new $\rightarrow$ dual write $\rightarrow$ remove old).
2. **Healthcheck Endpoints**:
   - Every service exposes `/healthz/live` (process alive) and `/healthz/ready` (database and dependencies accessible).
3. **Graceful Shutdown**:
   - Services intercept `SIGTERM` to complete in-flight risk calculations before terminating worker processes.
