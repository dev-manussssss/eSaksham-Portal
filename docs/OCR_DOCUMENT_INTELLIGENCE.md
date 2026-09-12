# OCR & Document Intelligence — SAKSHAM

## 1. Purpose

The Document Intelligence engine (`services/ocr-service`) digitizes, structures, and validates physical documentation commonly submitted during MPLADS works execution, notably **Measurement Books (MB)**, contractor tax invoices, and administrative sanction orders.

---

## 2. Document Processing Pipeline

```
[ Uploaded Scan / PDF ]
           │
           ▼
[ Preprocessing: Deskew, Binarize, Contrast Normalization ]
           │
           ▼
[ Layout Analysis: Table & Key-Value Extraction ]
           │
           ▼
[ Text Recognition (Multilingual: English, Hindi, Regional scripts) ]
           │
           ▼
[ Semantic Reconciliation & Verification Engine ]
  ├── Arithmetic Verification (Item Rate * Quantity = Total Amount)
  ├── Measurement Book vs. Invoice Line Comparison
  └── Tax Identification & Date Sequence Validity
           │
           ▼
[ Structured JSON + Flagged Discrepancies with Bounding Box Coordinates ]
```

---

## 3. Specific Integrity Checks

1. **Measurement Book (MB) Reconciliation**:
   - Compares physical dimensions (length, breadth, depth) entered by Junior Engineers with approved standard Schedule of Rates (SOR).
   - Detects mathematical inflation of quantities between intermediate and final bills.
2. **Tax Invoice Integrity**:
   - Validates invoice numbering sequence (detecting out-of-sequence invoices created retrospectively).
   - Confirms GSTIN checksum and active registration status on the invoice date.
3. **Tamper & Edit Detection**:
   - Detects irregular font kerning, digital splicing, or manual white-out/overwriting on scanned sanction copies.

---

## 4. Output Contract

The service outputs structured data containing:
- Extracted key-value fields.
- Normalized line items table.
- List of discrepancies with bounding-box pixel coordinates `[ymin, xmin, ymax, xmax]` for direct visual highlight on the frontend.
