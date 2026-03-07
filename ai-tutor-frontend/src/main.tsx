import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import "katex/dist/katex.min.css"
import { initializeUIPreferences } from "./lib/uiPreferences"
import { initGradientTheme } from "./pages/Settings"

// Apply persisted preferences before first render so there's no flash
initializeUIPreferences()
initGradientTheme()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
