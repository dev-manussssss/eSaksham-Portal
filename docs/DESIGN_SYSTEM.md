# Design System & Token Specification — SAKSHAM

## 1. Brand & Palette Tokens

SAKSHAM utilizes an official, restrained visual identity tailored for institutional trust, visual fatigue reduction during long audit sessions, and high sunlight legibility on mobile field devices.

```css
:root {
  /* Brand Primary */
  --saksham-primary: #0a3871;
  --saksham-primary-dark: #07254d;
  --saksham-primary-light: #1e5aa0;
  --saksham-primary-tint: #eff6ff;

  /* Surfaces & Neutrals */
  --saksham-bg-canvas: #f8fafc;
  --saksham-bg-surface: #ffffff;
  --saksham-border-subtle: #e2e8f0;
  --saksham-border-default: #cbd5e1;
  --saksham-text-primary: #0f172a;
  --saksham-text-secondary: #475569;
  --saksham-text-muted: #64748b;

  /* Semantic Risk Accents */
  --risk-low: #059669;
  --risk-low-bg: #ecfdf5;
  --risk-low-border: #a7f3d0;

  --risk-mod: #d97706;
  --risk-mod-bg: #fffbeb;
  --risk-mod-border: #fde68a;

  --risk-high: #dc2626;
  --risk-high-bg: #fef2f2;
  --risk-high-border: #fecaca;

  --risk-critical: #991b1b;
  --risk-critical-bg: #450a0a;
  --risk-critical-text: #fecaca;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

---

## 2. Standardized Components

1. **Risk Badge (`.saksham-badge`)**:
   - Compact pill display: Score $[0 - 100]$ + Category (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
2. **Evidence Drawer (`.saksham-evidence-drawer`)**:
   - Slide-over panel displaying the exact artifact (photo diff, OCR crop, graph edge) backing an anomaly flag.
3. **Statutory Status Indicator (`.saksham-status-indicator`)**:
   - Clear visual token for project stage (Sanctioned, Tendered, In Progress, Inspected, Completed).
