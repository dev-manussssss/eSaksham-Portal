# Error Handling & Resilience — SAKSHAM

## 1. Resilience Philosophy

SAKSHAM operates in mission-critical administrative environments. Service failures, connectivity drops, and partial microservice outages must never disrupt essential government operations or corrupt audit trails.

---

## 2. Core Resilience Strategies

### 2.1 Graceful Analytical Degradation
- If the Computer Vision or OCR microservice becomes unavailable, the core portal remains completely operational.
- The UI renders explicit, truthful indicators:
  - `[ANALYSIS STATUS: IN QUEUE]`
  - `[VISUAL VERIFICATION: SERVICE TEMPORARILY UNAVAILABLE - MANUAL INSPECTION PERMITTED]`
- **Zero Fabrication**: Under no circumstances will the system generate synthetic, random, or mock risk scores to replace a failed service response.

### 2.2 Circuit Breakers & Dead-Letter Queues (DLQ)
- External and internal analytical calls are wrapped in circuit breakers.
- Failed document processing jobs are directed to a Dead-Letter Queue with exponential backoff and operator inspection tooling.

### 2.3 Standardized Error Envelopes
Every HTTP error returned by SAKSHAM adheres to a structured, machine-parsable format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ENTITY_LOCKED_CONCURRENT_EDIT",
    "message": "This investigation record was modified by another officer at 14:22:10. Please reload.",
    "details": {
      "entity_id": "8b51296c-17e9-4e5a-8b1b-7589d9e604f3",
      "server_version": 4,
      "submitted_version": 3
    }
  },
  "meta": {
    "timestamp": "2026-09-11T12:05:30Z",
    "request_id": "req-98012-err"
  }
}
```
