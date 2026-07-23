import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import ThemeToggle from "../components/ThemeToggle"
import { getApiBaseUrl } from "../lib/api"

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const apiUrl = getApiBaseUrl()
      await axios.post(`${apiUrl}/register`, { email, password })
      navigate("/login")
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Registration failed.")
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
        <div style={{ padding: "2rem", background: "var(--sr-bg-card-strong)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <p style={{ margin: "0 0 0.3rem", color: "var(--sr-wine)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Register
              </p>
              <h1 style={{ fontSize: "2.2rem", marginBottom: "0.35rem" }}>Create your Stella account</h1>
              <p style={{ margin: 0, color: "var(--sr-text-soft)" }}>
                Set up your tutor workspace in under a minute.
              </p>
            </div>
            <ThemeToggle compact />
          </div>

          <div style={{ display: "grid", gap: "1rem", marginTop: "1.6rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-base"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              className="field-base"
            />
            {error && <p style={{ margin: 0, color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}
            <button type="button" className="btn-primary" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/login")}>
              Back to login
            </button>
          </div>
        </div>

        <div style={{ background: "var(--sr-hero-gradient)", color: "#fff", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>
            What you unlock
          </p>
          <h2 style={{ color: "#fff", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginBottom: "1rem" }}>
            A workspace that feels <span className="sunrise-wordmark">Stellar</span>
          </h2>
          <div style={{ display: "grid", gap: "0.8rem" }}>
            {["Physics and Math chat flows", "Live response analytics", "Progress tracking and readable settings"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <span style={{ fontWeight: 800 }}>✦</span>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.82)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
