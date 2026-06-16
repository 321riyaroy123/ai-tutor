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

  const handleRegister = async () => {
    try {
      const apiUrl = getApiBaseUrl()
      await axios.post(`${apiUrl}/register`, {
        email,
        password,
      })

      navigate("/login")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed")
    }
  }

  return (
    <div className="app-shell page-container flex items-center justify-center">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="academic-card w-full max-w-md p-8 sm:p-10"
      >
        <h1 className="mb-3 text-center text-4xl">
          Create Account
        </h1>
        <p className="mb-7 text-center text-sm text-[var(--text-soft)]">
          Set up your tutor workspace in under a minute.
        </p>

        <div className="space-y-4" aria-live="polite">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-base"
            aria-label="Email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-base"
            aria-label="Password"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRegister()
            }}
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleRegister}
            className="btn-secondary w-full"
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-outline w-full"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}
