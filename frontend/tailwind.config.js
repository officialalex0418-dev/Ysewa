/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ys-emerald": "#08976B",
        "ys-emerald-hover": "#0B7A5A",
        "ys-deep-pine": "#175C49",
        "ys-mint": "#3CB58C",
        "ys-mint-tint": "#E8FFEE",
        "ys-success": "#14813E",
        "ys-warning": "#B3570C",
        "ys-danger": "#C92D30",
        "ys-info": "#405491",
        "ys-surface": "#FFFFFF",
        "ys-canvas": "#F7F8FA",
        "ys-border": "#E2E7ED",
        "ys-ink": "#1E1E1E",
        "ys-ink-muted": "#4A505C",
        "ys-ink-subtle": "#8B93A3",
      },
    },
  },
  plugins: [],
};
