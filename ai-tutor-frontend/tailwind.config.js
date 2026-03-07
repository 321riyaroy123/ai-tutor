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
        brandBlue:      "#1C6FF8",
        brandCyan:      "#0FBED8",
        brandTeal:      "#27BBE0",
        brandNeonGreen: "#1BF118",
        brandGreen:     "#31DB92",
        brandLime:      "#9BFA24",
        brandYellow:    "#FFD639",
        brandGold:      "#FEF720",
        brandMagenta:   "#FF00FF",
        brandPurple:    "#8F00FF",
        brandOrange:    "#FD9346",
      },
      boxShadow: {
        card: "0 4px 24px rgba(28,111,248,0.10), 0 1.5px 6px rgba(15,190,216,0.07)",
        glow: "0 0 18px rgba(39,187,224,0.45), 0 0 6px rgba(28,111,248,0.25)",
        "glow-green": "0 0 18px rgba(49,219,146,0.45)",
        "glow-yellow": "0 0 18px rgba(255,214,57,0.45)",
        "glow-purple": "0 0 18px rgba(143,0,255,0.35)",
      },
      fontFamily: {
        serif:   ["Merriweather", "Georgia", "serif"],
        sans:    ["Source Sans 3", "Segoe UI", "sans-serif"],
        legible: ["Atkinson Hyperlegible", "Verdana", "sans-serif"],
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
