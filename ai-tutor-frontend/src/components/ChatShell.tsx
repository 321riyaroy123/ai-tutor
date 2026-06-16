import { useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"
import AnalyticsPanel from "./AnalyticsPanel"
import type { AnalyticsData } from "./AnalyticsPanel"

const SUBJECTS = [
  { label: "Physics", icon: "\u269B", to: "/physics/new" },
  { label: "Math",    icon: "\u2211", to: "/math/new"    },
]

interface ChatShellProps {
  title: string
  recentTopics?: string[]
  analytics?: AnalyticsData
  children: ReactNode
}

export default function ChatShell({ title, recentTopics = [], analytics, children }: ChatShellProps) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="app-shell" style={{ display: "flex", flexDirection: "row", minHeight: "100vh", width: "100%", alignItems: "stretch" }}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{
              borderRight: "1px solid var(--surface-border)", background: "var(--surface-0)",
              backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", overflow: "hidden",
              height: "100vh", position: "sticky", top: 0,
            }}
          >
            <div style={{ padding: "1.1rem 0.9rem", borderBottom: "1px solid var(--surface-border)" }}>
              <Link to="/dashboard" style={{ textDecoration: "none", display: "block", marginBottom: "0.9rem" }}>
                <span style={{
                  fontFamily: "Playfair Display,Georgia,serif", fontSize: "1.1rem", fontWeight: 700,
                  background: "var(--primary-gradient)", WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  Stella<span style={{ color: "var(--text-main)", WebkitTextFillColor: "var(--text-main)" }}>AI</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => navigate(`/${title.toLowerCase()}/new`)}
                className="btn-primary"
                style={{ width: "100%", fontSize: "0.85rem" }}
              >
                ✨ New Chat
              </button>
            </div>

            <div style={{ padding: "1rem 0.9rem", flex: 1, overflowY: "auto" }} className="chat-scrollbar">
              <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                Subjects
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                {SUBJECTS.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className={`nav-item${s.label.toLowerCase() === title.toLowerCase() ? " active" : ""}`}
                  >
                    <span style={{ width: "20px", textAlign: "center", flexShrink: 0 }}>{s.icon}</span>
                    {s.label} Tutor
                  </Link>
                ))}
              </div>

              {recentTopics.length > 0 && (
                <>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: "1.4rem 0 0.6rem" }}>
                    Recent
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                    {recentTopics.map((topic) => (
                      <span key={topic} className="nav-item" style={{ cursor: "default" }}>
                        <span style={{ width: "20px", textAlign: "center", flexShrink: 0, fontSize: "0.8rem" }}>◷</span>
                        {topic}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: "0.9rem", borderTop: "1px solid var(--surface-border)" }}>
              <button type="button" onClick={() => navigate("/dashboard")} className="btn-outline" style={{ width: "100%", fontSize: "0.85rem" }}>
                ← Dashboard
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{
          borderBottom: "1px solid var(--surface-border)", padding: "0.85rem 1.2rem",
          display: "flex", alignItems: "center", gap: "0.85rem", background: "var(--surface-0)",
        }}>
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            style={{
              background: "none", border: "1px solid var(--surface-border)", borderRadius: "0.55rem",
              width: "32px", height: "32px", cursor: "pointer", color: "var(--text-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "transform 0.2s ease",
            }}
          >
            ‹
          </button>
          <div style={{ width: "30px", height: "30px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
            <Lottie animationData={wingedTeacher} loop />
          </div>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>Stella</p>
            <p style={{ fontSize: "0.72rem", color: "var(--link-color)", margin: 0 }}>● Online</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>

      <AnalyticsPanel data={analytics} />
    </div>
  )
}
