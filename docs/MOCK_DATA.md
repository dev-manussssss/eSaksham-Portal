# Mock Data Standards & Scenario Catalog — SAKSHAM

## 1. Purpose

This document outlines the data schemas and realistic scenarios required for test fixtures, staging environments, and verification suites.

---

## 2. Realistic Ground-Truth Scenarios

### Scenario 1: The Splitting Anomaly (Tender Risk)
- **Pattern**: 4 separate work orders of ₹24.8 Lakhs each issued on the same day for continuous segments of the same rural road network.
- **Statutory Rule**: Bypasses District Technical Sanction committee threshold (₹25 Lakhs) requiring State Chief Engineer clearance.
- **Risk Flag**: `TENDER_SPLIT_WORK_ORDERS` (Score: 88, Severity: `HIGH`).

### Scenario 2: Ghost Asset & Reused Inspection Image (CV + Inspection Risk)
- **Pattern**: Project `MP-UP-2025-081` (Anganwadi Center) uploads an inspection photo with perceptual hash identical (`pHash Hamming Distance = 0`) to an image submitted 6 months prior for Project `MP-UP-2024-340`.
- **Evidence Attached**: Side-by-side comparison with overlaid SHA256 hashes and EXIF metadata comparison showing original 2024 capture date.

### Scenario 3: Bidding Cartel with Common Director (Fraud Graph)
- **Pattern**: Three entities (`M/s Shiva Enterprises`, `Om Construction`, `Rudraksh Infratech`) submit bids for a community drinking water project.
- **Evidence**: Ministry of Corporate Affairs (MCA) records indicate `Om Construction` and `Rudraksh Infratech` share Director `DIN: 08492011`, and both list the identical primary contact phone number.

### Scenario 4: Measurement Book (MB) Arithmetic Inflation (OCR Risk)
- **Pattern**: Handwritten MB entry records excavation of $120\text{m} \times 4\text{m} \times 1.5\text{m} = 720\text{ m}^3$. Contractor bill claims $1,720\text{ m}^3$.
- **Evidence**: OCR bounding box highlight directly on the scanned MB sheet line item indicating the mathematical discrepancy.
