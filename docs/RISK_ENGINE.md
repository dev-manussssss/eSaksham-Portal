# Risk Engine Specification — SAKSHAM

## 1. Purpose & Risk Dimension Isolation

A critical requirement of SAKSHAM is that risk dimensions must **remain distinct and unpolluted**. A vendor with a past delay record must not artificially distort an inspection image verification score, although both contribute transparently to an overall composite score.

---

## 2. The Six Separate Risk Dimensions

### Dimension 1: Vendor Risk (Longitudinal)
- **Nature**: Historical performance and capacity analysis.
- **Indicators**:
  - Capacity saturation (active contracts vs. declared turnover).
  - Inter-state blacklisting history.
  - Frequent changes in company directors or registered address.
  - Negative completion margin history.

### Dimension 2: Tender Risk
- **Nature**: Bidding behavior and procurement anomalies.
- **Indicators**:
  - Split work orders (multiple tenders issued just below financial sanction limits, e.g., ₹24.9 Lakhs to bypass district technical sanction ceilings).
  - Rotation of winning bidders among a closed set of contractors.
  - Exact or near-identical bid prices submitted by competitors.
  - Single-bidder tenders repeatedly awarded to the same entity.

### Dimension 3: Project Risk
- **Nature**: Execution velocity and schedule adherence.
- **Indicators**:
  - Significant divergence between elapsed time and physical completion.
  - Unjustified project suspension or site abandonment.
  - Escalating revised cost estimates without formal revised sanction.

### Dimension 4: Inspection Risk
- **Nature**: Authenticity and integrity of field verification.
- **Indicators**:
  - GPS coordinates outside project boundary polygon.
  - Inspection photograph reused from an earlier project or different location.
  - EXIF capture timestamp mismatching submission timestamp.
  - Insufficient photo coverage of critical structural milestones.

### Dimension 5: Payment Risk
- **Nature**: Financial disbursements vs. physical progress.
- **Indicators**:
  - Disbursement percentage exceeding certified physical milestone percentage.
  - Multiple rapid advance releases without Measurement Book reconciliation.
  - Payment released prior to third-party quality inspection report submission.

### Dimension 6: Document Intelligence / OCR Risk
- **Nature**: Documentary authenticity and clerical integrity.
- **Indicators**:
  - Inconsistency between handwritten Measurement Book entries and digital bills.
  - GSTIN status cancelled, dormant, or non-matching on invoice dates.
  - Overwriting or font variations detected on sanction letters.

---

## 3. Composite Risk Calculation

The composite risk score $R_{composite}$ is an explainable weighted aggregation:

$$R_{composite} = \sum_{i=1}^{6} w_i \cdot R_i$$

Where:
- $\sum w_i = 1.0$
- $R_i \in [0.0, 100.0]$
- Weights $w_i$ are deterministically configured by administrative policy, not hidden in black-box parameters.
- If any single dimension reaches `CRITICAL` (> 85), the overall case flags an immediate statutory review alert regardless of average weights.
