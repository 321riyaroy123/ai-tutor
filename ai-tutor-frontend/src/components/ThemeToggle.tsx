import { useState } from "react"
import { getTheme, toggleTheme } from "../lib/uiPreferences"

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme())

  const handleToggle = () => {
    const nextTheme = toggleTheme()
    setTheme(nextTheme)
  }

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="btn-outline min-w-32 text-sm"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  )
}
