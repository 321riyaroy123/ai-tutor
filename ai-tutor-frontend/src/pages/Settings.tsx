import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import ThemeToggle from "../components/ThemeToggle"
import {
  getFontScale,
  isDyslexiaFriendlyEnabled,
  setDyslexiaFriendly,
  setFontScale,
} from "../lib/uiPreferences"

// ─── Gradient themes ───────────────────────────────────────────────────────
const GRADIENT_THEMES = [
  {
    id:       "oceanic",
    label:    "Oceanic",
    gradient: "linear-gradient(135deg, #0974F1, #2F6364)",
    preview:  ["#0974F1", "#2F6364"],
  },
  {
    id:       "lavender",
    label:    "Lavender",
    gradient: "linear-gradient(135deg, #696EFF, #F8ACFF)",
    preview:  ["#696EFF", "#F8ACFF"],
  },
  {
    id:       "lemon",
    label:    "Lemon",
    gradient: "linear-gradient(135deg, #5CB270, #F4F269)",
    preview:  ["#5CB270", "#F4F269"],
  },
  {
    id:       "midnight",
    label:    "Midnight",
    gradient: "linear-gradient(135deg, #103783, #9BAFD9)",
    preview:  ["#103783", "#9BAFD9"],
  },
] as const

type GradientId = (typeof GRADIENT_THEMES)[number]["id"]

function getStoredGradient(): GradientId {
  return (localStorage.getItem("gradientTheme") as GradientId) ?? "oceanic"
}

function applyGradientTheme(id: GradientId) {
  const theme = GRADIENT_THEMES.find((t) => t.id === id)
  if (!theme) return
  document.documentElement.style.setProperty("--primary-gradient", theme.gradient)
  localStorage.setItem("gradientTheme", id)
}

// Call once on load (also called from main.tsx / uiPreferences ideally)
export function initGradientTheme() {
  applyGradientTheme(getStoredGradient())
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate()
  const [fontScale,      setFontScaleState] = useState(getFontScale())
  const [dyslexiaFriendly, setDyslexiaState] = useState(isDyslexiaFriendlyEnabled())
  const [activeGradient, setActiveGradient]  = useState<GradientId>(getStoredGradient())

  const handleScaleChange = (value: number) => {
    setFontScale(value)
    setFontScaleState(value)
  }

  const handleDyslexiaToggle = () => {
    const next = !dyslexiaFriendly
    setDyslexiaFriendly(next)
    setDyslexiaState(next)
  }

  const handleGradientSelect = (id: GradientId) => {
    applyGradientTheme(id)
    setActiveGradient(id)
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Personalise your study environment.
          </p>
        </div>
        <button type="button" className="btn-outline" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </div>

      <div className="space-y-5">

        {/* Theme mode */}
        <section className="academic-card p-6">
          <h2 className="text-xl">Theme Mode</h2>
          <p className="mb-5 mt-1 text-sm text-[var(--text-soft)]">
            Toggle between light and dark UI with a smooth transition.
          </p>
          <ThemeToggle />
        </section>

        {/* Gradient colour theme */}
        <section className="academic-card p-6">
          <h2 className="text-xl">Colour Theme</h2>
          <p className="mb-5 mt-1 text-sm text-[var(--text-soft)]">
            Choose the primary gradient used across buttons, avatars, and accents.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GRADIENT_THEMES.map((theme) => {
              const isActive = activeGradient === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleGradientSelect(theme.id)}
                  aria-pressed={isActive}
                  className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200
                    ${isActive
                      ? "border-[var(--primary-gradient)] shadow-glow scale-[1.03]"
                      : "border-[var(--surface-border)] hover:border-[var(--text-muted)] hover:scale-[1.01]"
                    }`}
                  style={isActive ? { borderColor: theme.preview[0] } : undefined}
                >
                  {/* Gradient swatch */}
                  <div
                    className="h-10 w-full rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-[1.03]"
                    style={{ background: theme.gradient }}
                  />

                  {/* Label row */}
                  <div className="flex w-full items-center justify-between px-0.5">
                    <span className="text-xs font-semibold text-[var(--text-main)]">
                      {theme.label}
                    </span>
                    {isActive && (
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
                        style={{ background: theme.gradient }}
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Live preview strip */}
          <div className="mt-5">
            <p className="mb-2 text-xs text-[var(--text-muted)]">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full shadow-glow"
                style={{ background: "var(--primary-gradient)" }}
              />
              <button className="btn-primary text-sm px-5 py-1.5">
                Primary button
              </button>
              <span
                className="badge-glow text-xs"
                style={{ background: "var(--primary-gradient)", color: "#fff", padding: "2px 10px", borderRadius: "99px" }}
              >
                badge
              </span>
            </div>
          </div>
        </section>

        {/* Font scale */}
        <section className="academic-card p-6">
          <h2 className="text-xl">Font Scale</h2>
          <p className="mb-4 mt-1 text-sm text-[var(--text-soft)]">
            Adjust text size for comfortable reading.
          </p>

          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="fontScale" className="text-sm font-semibold">
              Current scale
            </label>
            <span className="badge-glow">{Math.round(fontScale * 100)}%</span>
          </div>

          <input
            id="fontScale"
            type="range"
            min={0.9}
            max={1.25}
            step={0.05}
            value={fontScale}
            onChange={(e) => handleScaleChange(Number(e.target.value))}
            className="w-full accent-brandTeal"
            aria-label="Font scale slider"
          />

          <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
            <span>90%</span><span>125%</span>
          </div>
        </section>

        {/* Dyslexia */}
        <section className="academic-card p-6">
          <h2 className="text-xl">Dyslexia-Friendly Text</h2>
          <p className="mb-5 mt-1 text-sm text-[var(--text-soft)]">
            Switches to Atkinson Hyperlegible with increased letter-spacing and line-height
            throughout the app.
          </p>
          <button
            type="button"
            onClick={handleDyslexiaToggle}
            className={dyslexiaFriendly ? "btn-primary" : "btn-outline"}
          >
            {dyslexiaFriendly ? "✓ Enabled — Click to Disable" : "Enable Dyslexia-Friendly Mode"}
          </button>
        </section>

      </div>
    </Layout>
  )
}
