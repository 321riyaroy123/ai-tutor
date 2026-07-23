import { useState } from "react"
import Layout from "../components/Layout"
import ThemeToggle from "../components/ThemeToggle"
import {
  getFontScale,
  isDyslexiaFriendlyEnabled,
  setDyslexiaFriendly,
  setFontScale,
} from "../lib/uiPreferences"

export default function Settings() {
  const [fontScale, setFontScaleState] = useState(getFontScale())
  const [dyslexiaFriendly, setDyslexiaState] = useState(isDyslexiaFriendlyEnabled())

  return (
    <Layout>
      <section style={{ marginBottom: "1.2rem" }}>
        <p style={{ margin: "0 0 0.3rem", color: "var(--sr-wine)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Settings
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: "0.5rem" }}>Personalize your workspace</h1>
        <p style={{ margin: 0, color: "var(--sr-text-soft)", maxWidth: "40rem" }}>
          Keep the visual system consistent while making the reading experience more comfortable.
        </p>
      </section>

      <div style={{ display: "grid", gap: "1rem" }}>
        <section className="academic-card" style={{ padding: "1.4rem" }}>
          <h2 style={{ fontSize: "1.35rem", marginBottom: "0.45rem" }}>Theme mode</h2>
          <p style={{ margin: "0 0 1rem", color: "var(--sr-text-soft)" }}>
            Switch between the sunrise light mode and the darker evening workspace.
          </p>
          <ThemeToggle />
        </section>

        <section className="academic-card" style={{ padding: "1.4rem" }}>
          <h2 style={{ fontSize: "1.35rem", marginBottom: "0.45rem" }}>Font scale</h2>
          <p style={{ margin: "0 0 1rem", color: "var(--sr-text-soft)" }}>
            Adjust text size for longer study sessions.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem", alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>Current size</span>
            <span className="badge-glow">{Math.round(fontScale * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.9}
            max={1.25}
            step={0.05}
            value={fontScale}
            onChange={(e) => {
              const next = Number(e.target.value)
              setFontScale(next)
              setFontScaleState(next)
            }}
            style={{ width: "100%", accentColor: "var(--sr-wine)" }}
            aria-label="Font scale slider"
          />
        </section>

        <section className="academic-card" style={{ padding: "1.4rem" }}>
          <h2 style={{ fontSize: "1.35rem", marginBottom: "0.45rem" }}>Dyslexia-friendly reading</h2>
          <p style={{ margin: "0 0 1rem", color: "var(--sr-text-soft)" }}>
            Increase spacing and reading comfort across the app.
          </p>
          <button
            type="button"
            className={dyslexiaFriendly ? "btn-primary" : "btn-outline"}
            onClick={() => {
              const next = !dyslexiaFriendly
              setDyslexiaFriendly(next)
              setDyslexiaState(next)
            }}
          >
            {dyslexiaFriendly ? "Enabled - click to disable" : "Enable dyslexia-friendly mode"}
          </button>
        </section>
      </div>
    </Layout>
  )
}
