import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Login() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const res = await axios.post(`${API_URL}/login`, { email, password })
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div className="app-shell page-container flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="academic-card w-full max-w-md p-8 sm:p-10"
      >
        <h1 className="mb-2 text-center text-4xl">AI Tutor</h1>
        <p className="mb-7 text-center text-sm text-[var(--text-soft)]">
          Sign in to continue your study sessions.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="field-base w-full"
            aria-label="Email"
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="field-base w-full"
            aria-label="Password"
            autoComplete="current-password"
          />

          {error && (
            <p className="text-red-500 text-sm" role="alert">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="btn-outline w-full"
          >
            Create Account
          </button>
        </div>
      </motion.div>
    </div>
  )
}
