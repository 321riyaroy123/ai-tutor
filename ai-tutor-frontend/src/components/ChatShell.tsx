import { useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { NavLink, Link, useNavigate } from "react-router-dom"
import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"
import AnalyticsPanel from "./AnalyticsPanel"
import type { AnalyticsData } from "./AnalyticsPanel"

const subjects = [
  { label: "Physics", icon: "⚡", to: "/physics/new" },
  { label: "Math", icon: "∑", to: "/math/new" },
]

const SIDEBAR_WIDTH = 272
const SIDEBAR_COMPACT_WIDTH = 76
const ANALYTICS_WIDTH = 300

interface ChatShellProps {
  title: string
  recentTopics?: string[]
  analytics?: AnalyticsData
  children: ReactNode
}

export default function ChatShell({ title, recentTopics = [], analytics, children }: ChatShellProps) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  return (
    <div
      className="sunrise-shell"
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "var(--sr-bg-app, #FEFCFA)",
      }}
    >
      {/* LEFT SIDEBAR — single nav, ChatGPT-style */}
      <AnimatePresence mode="wait" initial={false}>
        {sidebarOpen ? (
          <motion.aside
            key="chat-sidebar-open"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="workspace-sidebar"
            style={{
              flex: `0 0 ${SIDEBAR_WIDTH}px`,
              width: SIDEBAR_WIDTH,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: `
                linear-gradient(165deg, rgba(254, 252, 250, 0.94) 0%, rgba(254, 252, 250, 0.86) 45%, rgba(254, 252, 250, 0.8) 100%),
                linear-gradient(165deg, #7b3ff2 0%, #9d4eda 18%, #b83060 42%, #d8703d 68%, #e89b3c 86%, #fdd835 100%)
              `,
              color: "var(--sr-text-ink)",
              padding: "1.25rem 1rem",
              borderRight: "1px solid var(--sr-divider)",
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              <NavLink
                to="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  textDecoration: "none",
                  color: "var(--sr-purple)",
                }}
              >
                <span className="sidebar-brand-mark">AI</span>

                <span
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontStyle: "italic",
                    fontSize: "1.65rem",
                    fontWeight: 800,
                  }}
                >
                  Stella
                  <span
                    style={{
                      fontSize: "1rem",
                      opacity: 0.85,
                      marginLeft: "0.15rem",
                    }}
                  >
                    AI
                  </span>
                </span>
              </NavLink>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse sidebar"
                style={{ padding: "0.45rem 0.6rem", fontSize: "0.85rem" }}
              >
                ⟨
              </button>
            </div>

            <button type="button" className="btn-primary" onClick={() => navigate(`/${title.toLowerCase()}/new`)}>
              ✦ New chat
            </button>

            <div>
              <p
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--sr-text-muted)",
                }}
              >
                Subjects
              </p>
              <div style={{ display: "grid", gap: "0.35rem" }}>
                {subjects.map((subject) => (
                  <Link
                    key={subject.to}
                    to={subject.to}
                    className={`nav-item${subject.label.toLowerCase() === title.toLowerCase() ? " active" : ""}`}
                  >
                    <span style={{ width: "1.4rem", textAlign: "center" }}>{subject.icon}</span>
                    {subject.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="academic-panel" style={{ padding: "1rem", flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
              <p
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--sr-text-muted)",
                }}
              >
                Recent prompts
              </p>
              <div style={{ display: "grid", gap: "0.45rem" }}>
                {recentTopics.length === 0 ? (
                  <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.86rem", lineHeight: 1.6 }}>
                    Your latest question previews will appear here.
                  </p>
                ) : (
                  recentTopics.map((topic, index) => (
                    <div key={`${topic}-${index}`} className="nav-item" style={{ cursor: "default", fontSize: "0.86rem" }}>
                      <span style={{ width: "1.4rem", textAlign: "center" }}>◦</span>
                      {topic}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button type="button" className="btn-outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </button>
          </motion.aside>
        ) : (
          <motion.aside
            key="chat-sidebar-compact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="workspace-sidebar"
            style={{
              flex: `0 0 ${SIDEBAR_COMPACT_WIDTH}px`,
              width: SIDEBAR_COMPACT_WIDTH,
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "0.75rem",
              padding: "1.25rem 0.75rem",
              borderRight: "1px solid var(--sr-divider)",
            }}
          >
            <button type="button" className="btn-outline" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" style={{ padding: "0.6rem 0.75rem" }}>
              ☰
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/${title.toLowerCase()}/new`)}
              aria-label="New chat"
              style={{ padding: "0.6rem 0.75rem" }}
            >
              ✦
            </button>
            {subjects.map((subject) => (
              <button
                key={subject.to}
                type="button"
                className={`btn-outline${subject.label.toLowerCase() === title.toLowerCase() ? " active" : ""}`}
                onClick={() => navigate(subject.to)}
                aria-label={subject.label}
                style={{ padding: "0.6rem 0.75rem" }}
              >
                {subject.icon}
              </button>
            ))}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CENTER — header + chat, capped width like a ChatGPT-style column */}
      <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <header
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--sr-divider)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            background: "rgba(253, 216, 53, 0.06)",
            backdropFilter: "blur(18px)",
            flex: "0 0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0 }}>
            {!sidebarOpen && (
              <div style={{ width: 0 }} />
            )}
            <div
              style={{
                width: "2.8rem",
                height: "2.8rem",
                borderRadius: "50%",
                overflow: "hidden",
                background: "var(--sr-bg-card-strong)",
                border: "1px solid var(--sr-card-border)",
                flexShrink: 0,
              }}
            >
              <Lottie animationData={wingedTeacher} loop />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: "0 0 0.12rem", fontWeight: 700 }}>{title} tutor</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexShrink: 0 }}>
            <div className="badge-glow">
              <span className="online-dot" />
              Live session
            </div>
            <button
              type="button"
              className={analyticsOpen ? "btn-primary" : "btn-outline"}
              onClick={() => setAnalyticsOpen((open) => !open)}
              style={{ padding: "0.6rem 0.85rem", fontSize: "0.85rem" }}
              aria-label="Toggle session analytics"
            >
              ◈ Analytics
            </button>
          </div>
        </header>

        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "56rem",
            margin: "0 auto",

            background: `
              radial-gradient(circle at center, rgba(123, 63, 242, 0.06)),
              transparent
            `,
          }}
        >
            {children}
        </div>
      </div>

      {/* RIGHT — collapsible analytics rail */}
      <AnimatePresence initial={false}>
        {analyticsOpen && (
          <motion.div
            key="analytics-rail"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: ANALYTICS_WIDTH, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: `0 0 ${ANALYTICS_WIDTH}px`,
              overflow: "hidden",
              borderLeft: "1px solid var(--sr-divider)",
            }}
          >
            <div style={{ width: ANALYTICS_WIDTH, height: "100%" }}>
              <AnalyticsPanel data={analytics}  />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}