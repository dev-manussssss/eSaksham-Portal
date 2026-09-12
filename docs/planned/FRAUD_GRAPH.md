# Fraud Relationship Graph — SAKSHAM

## 1. Purpose

The Fraud Relationship Graph microservice (`services/fraud-graph`) identifies hidden corporate ties, cartel rings, and collusive bidding networks operating across constituency procurement.

---

## 2. Graph Data Model

### Node Types
- `Vendor`: Commercial entity submitting bids or executing works.
- `Director`: Individual director / partner associated via Director Identification Number (DIN) or PAN.
- `Address`: Physical registered office or operating address.
- `Contact`: Registered mobile number or email domain.
- `Bank`: Hashed bank account representation (IFSC + SHA256(Account Number)).
- `Tender`: Specific procurement notice issued under MPLADS.

### Edge Types
- `(Vendor)-[:HAS_DIRECTOR]->(Director)`
- `(Vendor)-[:OPERATES_AT]->(Address)`
- `(Vendor)-[:USES_CONTACT]->(Contact)`
- `(Vendor)-[:TRANSFERS_VIA]->(Bank)`
- `(Vendor)-[:SUBMITTED_BID {timestamp, amount}]->(Tender)`
- `(Vendor)-[:AWARDED_CONTRACT {date}]->(Tender)`

---

## 3. Key Anomaly Detection Algorithms

1. **Collusive Bidding Subgraphs (Clique Detection)**:
   - Identifies groups of vendors that consistently bid on the same tenders, where one bidder consistently underbids while the others submit inflated "cover bids".
2. **Common Nexus Resolution**:
   - Two ostensibly competing bidders sharing the same physical address, telephone number, or bank branch.
   - Bidders where Director $A$ in Vendor $1$ is married to or is a co-director with Director $B$ in Vendor $2$.
3. **Circular Subcontracting**:
   - Detection of fund flow loops where a winning vendor routes payments back to shell entities owned by losing bidders.

---

## 4. Operational Boundaries

- Node matches must maintain confidence scores (e.g., Exact PAN match = 1.0, Levenshtein address string match = 0.85).
- Output is rendered visually in the investigation dossier as an interactive node-link graph with highlighted risk paths.
