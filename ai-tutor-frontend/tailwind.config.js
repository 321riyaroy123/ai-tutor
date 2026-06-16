/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brandOrchid:  "#E07CEA",
        brandLilac:   "#D089E6",
        brandPink:    "#FFC0ED",
        brandIndigo:  "#7C8CFF",
        brandMint:    "#8EF0C4",
        brandGold:    "#FFD86E",
      },
      boxShadow: {
        card: "0 4px 24px rgba(224,124,234,0.14), 0 1.5px 6px rgba(124,140,255,0.08)",
        glow: "0 0 18px rgba(208,137,230,0.45), 0 0 6px rgba(224,124,234,0.28)",
        "glow-mint":   "0 0 18px rgba(142,240,196,0.45)",
        "glow-gold":   "0 0 18px rgba(255,216,110,0.45)",
        "glow-indigo": "0 0 18px rgba(124,140,255,0.40)",
      },
      fontFamily: {
        serif:    ["Playfair Display", "Georgia", "serif"],
        sans:     ["DM Sans", "Segoe UI", "sans-serif"],
        legible:  ["Lexend", "Verdana", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeSlideUp: {
          "0%":   { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 1 },
          "50%":       { opacity: 0.6 },
        },
      },
      animation: {
        shimmer:      "shimmer 2.4s linear infinite",
        fadeSlideUp:  "fadeSlideUp 0.32s ease both",
        pulseGlow:    "pulseGlow 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
