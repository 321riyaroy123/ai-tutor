import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import ThemeToggle from "../components/ThemeToggle"
import { getApiBaseUrl } from "../lib/api"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const apiUrl = getApiBaseUrl()
      const res = await axios.post(`${apiUrl}/login`, { email, password })
      localStorage.setItem("token", res.data.access_token)
      navigate("/dashboard")
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Login failed. Please try again.")
      } else {
        setError("Unexpected error. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell sunrise-shell auth-shell">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="academic-card auth-card"
      >
        <div style={{ background: "var(--sr-hero-gradient)", color: "#fff", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 0.35rem", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>
                Sign in
              </p>
              <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>
                Stay <span className="sunrise-wordmark">Stellar</span>
              </h1>
            </div>
            <ThemeToggle compact />
          </div>

          <p style={{ margin: "1rem 0 0", maxWidth: "32rem", lineHeight: 1.8, color: "rgba(255,255,255,0.78)" }}>
            Return to your tutor workspace, reopen your subject flow, and keep your momentum without any friction.
          </p>
        </div>

        <div style={{ padding: "2rem", background: "var(--sr-bg-card-strong)" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Welcome back</h2>
          <p style={{ margin: "0 0 1.5rem", color: "var(--sr-text-soft)" }}>
            Sign in to continue your study sessions.
          </p>

          <div style={{ display: "grid", gap: "1rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="field-base"
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="field-base"
              autoComplete="current-password"
            />

            {error && <p style={{ margin: 0, color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}

            <button type="button" className="btn-primary" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/register")}>
              Create account
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/")}>
              Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
