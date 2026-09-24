/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #1F497D)",
          hover: "var(--color-primary-hover, #16375D)",
          active: "var(--color-primary-active, #0F2642)",
          subtle: "var(--color-primary-subtle, #EEF4FA)",
        },
        background: "var(--color-bg, #F8FAFC)",
        surface: {
          DEFAULT: "var(--color-surface, #FFFFFF)",
          card: "var(--color-surface, #FFFFFF)",
          base: "var(--color-bg, #F8FAFC)",
          subtle: "var(--color-surface-subtle, #F1F5F9)",
          container: "var(--color-surface-container, #E2E8F0)",
        },
        border: {
          subtle: "var(--color-border-subtle, #E2E8F0)",
          strong: "var(--color-border-strong, #CBD5E1)",
        },
        text: {
          primary: "var(--color-text-primary, #0F172A)",
          secondary: "var(--color-text-secondary, #475569)",
          muted: "var(--color-text-muted, #94A3B8)",
        },
        status: {
          success: {
            DEFAULT: "var(--color-success, #059669)",
            bg: "var(--color-success-bg, #ECFDF5)",
            text: "#047857",
            dot: "#10B981",
          },
          warning: {
            DEFAULT: "var(--color-warning, #D97706)",
            bg: "var(--color-warning-bg, #FFFBEB)",
            text: "#B45309",
            dot: "#F59E0B",
          },
          danger: {
            DEFAULT: "var(--color-danger, #DC2626)",
            bg: "var(--color-danger-bg, #FEF2F2)",
            text: "#B91C1C",
            dot: "#EF4444",
          },
          info: {
            DEFAULT: "var(--color-info, #2563EB)",
            bg: "var(--color-info-bg, #EFF6FF)",
            text: "#1D4ED8",
            dot: "#3B82F6",
          },
        },
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        elevated: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
