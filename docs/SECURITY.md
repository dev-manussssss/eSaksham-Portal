# Security Architecture & Data Protection — SAKSHAM

## 1. Threat Model & Security Scope

SAKSHAM processes procurement bids, vendor registrations, site coordinates, and officer audit histories. The security perimeter is engineered to mitigate:
- Unauthorized data access across jurisdictional boundaries.
- Tampering with historical risk logs or investigation records.
- Exposure of sensitive personal identifiers (Aadhaar, personal mobile numbers, raw bank account digits).
- Denial-of-service against analytical services.

---

## 2. Key Security Controls

1. **PII Masking & Privacy-Preserving Hashing**:
   - Bank accounts are normalized and stored as cryptographic hashes: `SHA-256(IFSC + CleanedAccountNumber)`.
   - Contractor personal contact numbers and personal email addresses are masked in UI views (`+91 98****1210`) except for verified administrative investigators.
2. **Cryptographic Checksums for Evidence**:
   - Every uploaded document, Measurement Book page, and inspection photo has its `SHA-256` content checksum computed and stored at ingestion.
   - Any modification of underlying storage triggers an immediate integrity alarm.
3. **Immutable Append-Only Audit Trail**:
   - The `audit_event_logs` table records every action: who viewed a case, who modified an investigation state, who dismissed a high-risk flag, and from which IP.
   - Logs are cryptographically chained (Merkle tree / sequential hash chain) to prevent retrospective modification.
4. **Network & Transport Security**:
   - Mandatory TLS 1.3 for all client-to-backend and service-to-service communications.
   - Internal microservices are isolated inside a private container network with zero external ingress.
