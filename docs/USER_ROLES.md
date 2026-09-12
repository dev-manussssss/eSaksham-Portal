# User Roles and Access Hierarchy — SAKSHAM

## 1. Purpose

This document outlines the operational roles, jurisdictional boundaries, and access entitlements within SAKSHAM. The design reflects the statutory administrative hierarchy governing the MPLADS scheme.

---

## 2. Defined Roles

### 1. District Authority / District Magistrate (DA / DM)
- **Scope**: Entire revenue district / constituency jurisdiction.
- **Responsibilities**: Overall statutory sanction, final administrative approval, initiation of formal multi-agency investigations.
- **Access**: Full view of all district works, high-risk flags, sanction-splitting alerts, and executive summary briefings.

### 2. District Nodal Officer (DNO)
- **Scope**: Day-to-day scheme monitoring for the district.
- **Responsibilities**: Verification of recommendations, coordination with implementing agencies, review of contractor billing anomalies.
- **Access**: In-depth project dossiers, vendor risk profiles, document discrepancy alerts, and investigation workflow management.

### 3. Implementing Agency Engineer / Junior Engineer (JE / AE)
- **Scope**: Assigned specific engineering works / packages.
- **Responsibilities**: Measurement Book recording, uploading geo-tagged inspection photos, milestone stage marking.
- **Access**: Upload portals, measurement reconciliation feedback, image validation reports.

### 4. State Nodal Department / State Monitor
- **Scope**: State-wide cross-district aggregation.
- **Responsibilities**: State-level oversight, identifying inter-district contractor cartels, monitoring fund utilization efficiency.
- **Access**: Cross-district analytical dashboards, state-wide fraud graphs, macro trend reports.

### 5. Central Ministry / Audit Monitor (MoSPI / CAG)
- **Scope**: National scope.
- **Responsibilities**: National policy adherence, structural fraud detection, inter-state shell entity networks.
- **Access**: Full anonymized or identifiable macro-intelligence graphs, audit trail exports.

---

## 3. Role-Permission Matrix

| Functional Area | District Authority (DA) | District Nodal Officer (DNO) | Field Engineer (JE/AE) | State Monitor | Central Audit |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Project Risk Scores | Read | Read | Restricted (Assigned) | Read (State) | Read (National) |
| Review Evidence Trails | Full | Full | Assigned Only | Full | Full |
| Initiate Investigation | Yes | Yes | No | Yes | Yes |
| Record Administrative Reason | Yes | Yes | No | No | No |
| Upload Site Photos / MB | No | No | Yes | No | No |
| Export Audit Dossier | Yes | Yes | No | Yes | Yes |
| Manage System Config | No | No | No | No | System Admin |

---

## 4. Operational Boundaries

- **Jurisdictional Segregation**: Field officers cannot view data outside their assigned district or implementing division unless explicitly granted cross-jurisdictional audit privileges.
- **Audit Immutability**: All reviews, dismissals of alerts, and manual overrides are permanently stamped with the officer's ID, timestamp, and mandatory written justification.
