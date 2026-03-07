const THEME_KEY = "theme"
const FONT_SCALE_KEY = "fontScale"
const DYSLEXIA_KEY = "dyslexiaFriendly"

export type ThemeMode = "light" | "dark"

export function getTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"
}

export function setTheme(theme: ThemeMode): void {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  localStorage.setItem(THEME_KEY, theme)
}

export function toggleTheme(): ThemeMode {
  const nextTheme: ThemeMode = getTheme() === "dark" ? "light" : "dark"
  setTheme(nextTheme)
  return nextTheme
}

export function getFontScale(): number {
  const stored = Number(localStorage.getItem(FONT_SCALE_KEY))
  if (!Number.isFinite(stored)) return 1
  return Math.min(1.25, Math.max(0.9, stored))
}

export function setFontScale(scale: number): void {
  const boundedScale = Math.min(1.25, Math.max(0.9, scale))
  document.documentElement.style.setProperty("--font-scale", boundedScale.toString())
  localStorage.setItem(FONT_SCALE_KEY, boundedScale.toString())
}

export function isDyslexiaFriendlyEnabled(): boolean {
  return localStorage.getItem(DYSLEXIA_KEY) === "true"
}

export function setDyslexiaFriendly(enabled: boolean): void {
  document.documentElement.classList.toggle("dyslexia-friendly", enabled)
  localStorage.setItem(DYSLEXIA_KEY, String(enabled))
}

export function initializeUIPreferences(): void {
  setTheme(getTheme())
  setFontScale(getFontScale())
  setDyslexiaFriendly(isDyslexiaFriendlyEnabled())
}
