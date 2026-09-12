# API Architecture & Endpoints — SAKSHAM

## 1. Purpose

This document outlines the API architectural standards, URI structure, request/response models, and error envelopes governing communication between SAKSHAM clients, backend orchestrators, and internal analytical microservices.

---

## 2. API Design Conventions

- **RESTful Resource URIs**: Resource-oriented URLs using plural nouns (e.g., `/api/v1/projects`, `/api/v1/investigations`).
- **Standardized Response Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": {
      "timestamp": "2026-09-11T12:00:00Z",
      "version": "1.0",
      "request_id": "req-89104-abc"
    }
  }
  ```
- **Idempotency**: All `POST` or `PUT` state-mutation endpoints accept an `Idempotency-Key` header to prevent double submissions.

---

## 3. Core Endpoint Catalog

### 3.1 Project & Surveillance Endpoints
- `GET /api/v1/projects`: List projects with filtering by district, risk severity, milestone status.
- `GET /api/v1/projects/{projectId}`: Full project profile, active risk scores, and milestone history.
- `GET /api/v1/projects/{projectId}/risk-dossier`: Aggregated risk signals across all 6 dimensions with evidence links.
- `GET /api/v1/projects/{projectId}/inspections`: Historical inspections with geo-coordinates, photos, and validation logs.

### 3.2 Vendor Risk Endpoints
- `GET /api/v1/vendors/{vendorId}`: Vendor longitudinal profile, active contracts, capacity utilization index.
- `GET /api/v1/vendors/{vendorId}/network-graph`: Connected entities (shared DINs, addresses, telephone numbers, bank hashes).

### 3.3 Investigation Endpoints
- `POST /api/v1/investigations`: Open a formal investigation.
  - Body: `{ "projectId": "...", "signalIds": ["..."], "initialNotes": "..." }`
- `GET /api/v1/investigations/{investigationId}`: Case details, frozen evidence snapshot, activity log.
- `PATCH /api/v1/investigations/{investigationId}/status`: Update case state (`UNDER_REVIEW`, `SHOW_CAUSE`, `CLOSED_*`).

### 3.4 Internal Microservice Interfaces (RPC / Service Endpoints)
- `POST /internal/v1/risk/evaluate`: Request risk recalculation for updated entity.
- `POST /internal/v1/cv/verify-image`: Submit image for milestone classification, EXIF integrity, and duplicate scan.
- `POST /internal/v1/ocr/process-document`: Submit Measurement Book page or invoice for tabular parsing.
- `POST /internal/v1/graph/resolve-entities`: Compute cluster similarity and cartel rings across bidders.

---

## 4. Authentication & Security Headers

- Standard `Authorization: Bearer <JWT>` containing user UUID, role, and district jurisdiction scope.
- Auditing headers: `X-Client-Role`, `X-District-Code`.
