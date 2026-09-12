# Computer Vision Service Specification — SAKSHAM

## 1. Purpose

The Computer Vision microservice (`services/cv-service`) verifies photographic evidence uploaded during physical site inspections. It prevents the submission of duplicate, recycled, digital-stock, or synthetically manipulated photographs representing project progress.

---

## 2. Core Capabilities

### 2.1 Perceptual Hash Duplicate Detection
- Computes perceptual fingerprints (`pHash`, `dHash`, `aHash`) for every uploaded inspection image.
- Maintains an indexed similarity index (e.g., using FAISS or Hamming distance search).
- Detects whether an image submitted for a community hall in District $A$ was previously uploaded for an Anganwadi center in District $B$ three months earlier.

### 2.2 Image Integrity & EXIF Forensics
- Parses EXIF metadata for hardware fingerprint, aperture, exposure, capture timestamp, and original GPS tags.
- Identifies inconsistencies between EXIF capture time and application upload time.
- Flags software editing signatures (e.g., Adobe Photoshop, Canva, GIMP metadata headers).
- Runs error level analysis (ELA) to detect spliced objects or pasted signage boards.

### 2.3 Construction Stage Milestone Classification
- Deep learning classifier categorizing visual construction phases:
  1. `SITE_PREPARATION` (Earth clearing, boundary marking)
  2. `FOUNDATION` (Excavation, rebar binding, concrete pour)
  3. `SUPERSTRUCTURE` (Columns, brick masonry, lintel level)
  4. `ROOFING` (Slab casting, truss erection)
  5. `FINISHING` (Plastering, painting, electrical fittings, completed asset)
- Flags discrepancies where an engineer claims 100% completion but uploaded imagery shows only foundation work.

---

## 3. Output Contract

- `is_duplicate`: Boolean
- `duplicate_match_id`: String (Reference to original photo if match found)
- `similarity_score`: Float [0.0 - 1.0]
- `detected_milestone`: Enum (`FOUNDATION`, `SUPERSTRUCTURE`, `COMPLETED`, etc.)
- `confidence`: Float [0.0 - 1.0]
- `tamper_flags`: Array[String] (e.g., `["EXIF_DISCREPANCY", "SOFTWARE_EDIT_DETECTED"]`)
