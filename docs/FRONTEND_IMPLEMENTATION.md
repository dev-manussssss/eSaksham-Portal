# Frontend Guidelines & UI Invariants — SAKSHAM

## 1. Design Philosophy & Purpose

The SAKSHAM frontend serves as a high-density, high-legibility decision-support cockpit for government administrative officers. It operates across mobile devices in the field and multi-monitor setups at district headquarters.

---

## 2. Mandatory Frontend Rules

1. **Mobile-First & Fully Responsive**:
   - Every view, table, and evidence comparison modal must be thoroughly functional on mobile viewport widths ($360\text{px} - 430\text{px}$) as well as high-resolution desktop displays.
2. **Preserve Operational Workflow**:
   - Follow the sequence familiar to e-SAKSHI users: Recommendation $\rightarrow$ Sanction $\rightarrow$ Tendering $\rightarrow$ Work Order $\rightarrow$ Execution $\rightarrow$ Inspection $\rightarrow$ Completion.
   - Refine visual clarity and ergonomics; **do not radically reinvent or disrupt established terminology**.
3. **Restrained, Semantic Color System**:
   - Primary: Official deep navy blue (`#0A3871`, `#1E40AF`) and crisp white.
   - Semantic Risk Colors:
     - `LOW RISK`: Emerald (`#059669`, `#D1FAE5`)
     - `MODERATE RISK`: Amber (`#D97706`, `#FEF3C7`)
     - `HIGH / CRITICAL RISK`: Rose / Crimson (`#DC2626`, `#FEE2E2`)
   - Neutral slate tones for borders, table headers, and structural chrome.
4. **Strictly No Decorative Clutter**:
   - No gratuitous floating widgets, decorative 3D elements, or empty animated cards.
   - Every metric card must display concrete, verifiable data.
   - **Zero Fake Statistics & Filler Text**: No "Lorem Ipsum", no placeholder percentages. If data is unavailable, display explicit empty states with explanations.
5. **Anti-Hallucination Labeling Rules**:
   - **NEVER** use: "V2", "V3", "Version 2", "SIH 2026", "SIH Edition".
   - **NEVER** invent fake ministry names, fictional portals, or unauthorized national seals.
   - Use official, accurate terminology: *Ministry of Statistics and Programme Implementation (MoSPI)*, *MPLADS Guidelines*, *District Authority*, *Implementing Agency*.
