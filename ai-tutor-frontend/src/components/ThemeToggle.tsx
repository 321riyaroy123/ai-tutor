import { useState } from "react"
import { getTheme, toggleTheme } from "../lib/uiPreferences"

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState(getTheme())

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={compact ? "btn-outline" : "btn-secondary"}
      style={compact ? { padding: "0.72rem 1rem" } : undefined}
    >
      {isDark ? "☀ Light" : "🌙 Dark"}
    </button>
  )
}
