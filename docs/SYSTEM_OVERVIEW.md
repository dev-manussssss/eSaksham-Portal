# System Overview — SAKSHAM

## 1. Purpose & Administrative Context

The **Members of Parliament Local Area Development Scheme (MPLADS)** enables Members of Parliament (MPs) to recommend developmental works of a capital nature with an emphasis on the creation of durable community assets based on locally felt needs.

While e-SAKSHI facilitates end-to-end operational processing (from recommendation to sanction and disbursement), complex patterns such as:
- **Collusive bidding & cartelization** among local contractors,
- **Artificial splitting of tenders** to evade administrative sanction ceilings,
- **Duplicate funding** across overlapping schemes (e.g., PMGSY, Smart Cities, State Funds),
- **Ghost assets** and recycled milestone inspection photographs,
- **Payment velocity anomalies** (releasing funds ahead of verified physical progress),

require an intelligent, autonomous analytical layer.

SAKSHAM addresses these challenges without disrupting existing official workflows.

---

## 2. Scope & Target Boundaries

### Within Scope
- Continuous monitoring of tenders, vendor profiles, project milestones, and physical inspections.
- Multi-dimensional risk evaluation (Vendor, Tender, Project, Inspection, Payment, Document).
- Automated entity resolution across PAN, GSTIN, Bank IFSC, and Director DIN networks.
- Verification of geotagged evidence and digital measurement book entries.
- Generation of transparent, evidence-linked investigative dossiers for officers.

### Out of Scope
- Autonomous financial approval or blocking of fund disbursements.
- Replacement of official government record-keeping systems.
- Autonomous blacklisting or statutory penalty enforcement.

---

## 3. High-Level System Workflow

1. **Ingestion**: SAKSHAM ingests recommendations, sanction orders, tender submissions, Measurement Book (MB) uploads, and geo-tagged inspection photos.
2. **Analysis**:
   - The **OCR & Document Engine** inspects MB lines and material bills.
   - The **CV Engine** validates the authenticity and progress milestone of site photos.
   - The **Geospatial Engine** tests coordinates against administrative boundary polygons.
   - The **Fraud Graph** searches for hidden co-bidding cartels and shell corporate linkages.
   - The **Risk Engine** maps findings into distinct, normalized risk dimensions.
3. **Surfacing**: District Authorities, Nodal Officers, and State Monitors view clear dashboards displaying prioritized alerts with clickable evidence trails.
4. **Action**: Officers review AI-generated evidence, annotate findings, launch formal investigations, or record verified justifications.
