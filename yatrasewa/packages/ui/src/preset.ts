/**
 * YatraSewa Tailwind preset (Tailwind v4 format).
 * Re-exported for use by @yatrasewa/web and (after NativeWind v4 support) @yatrasewa/mobile.
 *
 * Note: Tailwind v4 uses CSS-first configuration. This file exports the
 * CSS variables that the @theme block in styles.css maps into utilities.
 */
export const yatrasewaColors = {
  emerald: "#08976B",
  "emerald-hover": "#0B7A5A",
  "deep-pine": "#175C49",
  mint: "#3CB58C",
  "mint-tint": "#E8FFEE",
  success: "#14813E",
  warning: "#B3570C",
  danger: "#C92D30",
  info: "#405491",
  surface: "#FFFFFF",
  canvas: "#F7F8FA",
  border: "#E2E7ED",
  ink: "#1E1E1E",
  "ink-muted": "#4A505C",
  "ink-subtle": "#8B93A3",
} as const;

export const yatrasewaFonts = {
  sans: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
  body: ['"Inter"', "system-ui", "sans-serif"],
} as const;

export const yatrasewaRadii = {
  card: "12px",
  btn: "8px",
  modal: "16px",
} as const;

export const yatrasewaShadows = {
  card: "0 1px 3px rgba(30,30,30,.06), 0 1px 2px rgba(30,30,30,.04)",
  modal: "0 20px 40px rgba(23,92,73,.15), 0 4px 12px rgba(30,30,30,.08)",
  fab: "0 6px 20px rgba(8,151,107,.35)",
} as const;

const preset = {
  theme: {
    extend: {
      colors: yatrasewaColors,
      fontFamily: yatrasewaFonts,
      borderRadius: yatrasewaRadii,
      boxShadow: yatrasewaShadows,
    },
  },
};

export default preset;
