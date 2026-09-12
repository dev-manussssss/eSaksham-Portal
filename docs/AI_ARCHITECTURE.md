# AI & Analytics Architecture — SAKSHAM

## 1. Architectural Philosophy

The AI architecture in SAKSHAM is guided by five inviolable rules:
1. **Explainability Over Black Boxes**: Every flag must be linked to observable data features (pixel duplicates, DIN overlap, timestamp collision).
2. **Deterministic Caching**: Ingested artifacts (images, PDFs) produce immutable content hashes (`SHA-256`). AI pipelines run once per unique hash and version; results are stored in the database.
3. **No Execution on Page Refresh**: Frontend views query persisted DB analytical tables. The browser never triggers AI re-evaluation simply by viewing a record.
4. **Resilient Degradation**: If an AI worker is offline or under queue load, the system degrades gracefully with clear status badges (`ANALYSIS_QUEUED`, `OCR_IN_PROGRESS`) and maintains access to deterministic rule evaluations.
5. **No Autonomous Administration**: AI recommendations inform human officers; they never freeze funds, reject tenders, or disqualify contractors autonomously.

---

## 2. Microservice Topology

```
                   +----------------------------+
                   |     API Gateway / Core     |
                   +----------------------------+
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
    +--------------+      +--------------+      +--------------+
    |  OCR Service |      |  CV Service  |      | Fraud Graph  |
    | (LayoutLM /  |      |  (ResNet /   |      |  (NetworkX / |
    |  Tesseract)  |      |   pHash)     |      |   Neo4j)     |
    +--------------+      +--------------+      +--------------+
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
                   +----------------------------+
                   |        Risk Engine         |
                   | (Deterministic Rule Sets + |
                   |  Composite Scoring Model)  |
                   +----------------------------+
                                 │
                                 ▼
                   +----------------------------+
                   |     LLM Summary Layer      |
                   | (Grounded Audit Briefings) |
                   +----------------------------+
```

---

## 3. Core Engine Profiles

### 3.1 OCR & Document Intelligence (`services/ocr-service`)
- Scans contractor invoices, sanction letters, and physical Measurement Book (MB) pages.
- Validates totals against line items, detects invoice date tampering, and matches claimed GSTIN against registered records.

### 3.2 Computer Vision (`services/cv-service`)
- Computes perceptual hashes (`pHash`, `dHash`) across all uploaded site inspection photos to catch cross-project image reuse.
- Verifies image metadata against declared upload timestamp and detects digital editing artifacts.
- Classifies construction milestone stage (Foundation, Plinth, Superstructure, Roofing, Finishing).

### 3.3 Fraud Relationship Graph (`services/fraud-graph`)
- Constructs a heterogeneous knowledge graph of Vendors, Directors, Addresses, Phone Numbers, and Bank Hashes.
- Identifies collusive bidding cliques and shadow ownership via community detection algorithms.

### 3.4 Risk Engine (`services/risk-engine`)
- Synthesizes findings across the six core risk dimensions.
- Normalizes individual indicators into a weighted score [0.0 - 100.0] accompanied by an explainability rationale.

### 3.5 LLM Synthesis Layer (`services/llm-service`)
- Generates natural language audit briefings and executive summaries for District Magistrates.
- Strictly constrained to structured evidence inputs; temperature set to 0.0 with mandatory citation markers.
