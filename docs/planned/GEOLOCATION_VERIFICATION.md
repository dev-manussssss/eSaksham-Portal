# Geolocation & Cadastral Verification — SAKSHAM

## 1. Purpose

The Geolocation Verification engine ensures that proposed and executed MPLADS works exist at authentic, authorized geographic locations, within parliamentary constituency boundaries, and not on private or disallowed land parcels.

---

## 2. Verification Workflows

### 2.1 Cadastral & Boundary In-Polygon Check
- Matches reported project coordinates `(Latitude, Longitude)` against official Survey of India / Local Government Directory (LGD) constituency and block boundary GeoJSON polygons.
- Instantly flags works sanctioned under Constituency $X$ whose physical coordinates fall inside Constituency $Y$.

### 2.2 GPS Spoofing & EXIF Coordinate Audit
- Cross-references mobile app network telemetry with GPS hardware fixes.
- Flags impossible velocity spikes between successive inspection uploads by the same field engineer.
- Verifies altitude/elevation against Digital Elevation Models (DEM) to catch coordinate inversion or coordinate spoofing.

### 2.3 Proximity & Duplicate Asset Check
- Performs spatial radius queries (e.g., $r = 50\text{m}$) against historical MPLADS, state scheme, and municipal asset databases.
- Identifies potential "double dipping" where a new sanction is issued to rebuild or claim credit for an already completed municipal asset.

---

## 3. Storage & Spatial Indexing

- Backed by PostGIS spatial extensions.
- Spatial index: `GIST(geom_point)`.
- Coordinate Reference System (CRS): Standard `WGS 84` (`EPSG:4326`).
