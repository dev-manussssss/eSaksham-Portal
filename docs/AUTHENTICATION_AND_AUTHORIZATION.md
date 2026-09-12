# Authentication & Authorization Architecture — SAKSHAM

## 1. Authentication Architecture

- **Standards**: OpenID Connect (OIDC) / OAuth 2.0 with JSON Web Tokens (JWT).
- **Session Tokens**: Short-lived access tokens (15-minute validity) accompanied by secure, `HttpOnly`, `SameSite=Strict` refresh tokens stored in backend redis/database sessions.
- **Multi-Factor Authentication (MFA)**: Mandatory Time-based One-Time Password (TOTP) or official government OTP for high-privilege operations (sanction review, investigation status closure).

---

## 2. Authorization & Role-Based Access Control (RBAC)

SAKSHAM enforces fine-grained Attribute-Based Access Control (ABAC) built on top of traditional RBAC:

$$\text{Permission} = f(\text{User Role}, \text{Jurisdiction / District}, \text{Resource Owner}, \text{Action})$$

### Access Rules
1. **District Isolation**: An officer assigned to District `VARANASI` cannot view non-public investigation records or unredacted bids from District `PRAYAGRAJ`.
2. **Read vs. Investigate Privileges**:
   - `DISTRICT_VIEWER`: Can view aggregated project risk scores.
   - `INVESTIGATING_OFFICER`: Can add notes, attach formal exhibits, and draft show-cause notices.
   - `DISTRICT_AUTHORITY`: Can sanction, close cases with cause, and refer cases to statutory state vigilance bodies.
3. **Field Engineer Scoping**: Field engineers only see and upload data for work orders explicitly assigned to their sub-division.
