import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import AnalyticsPanel, { defaultAnalytics } from "../components/AnalyticsPanel"
import Sidebar from "../components/Sidebar"
import Stella from "../components/Stella"

const stats = [
  {
    value: "14",
    label: "Sessions",
    note: "2 this week",
    progress: 72,
  },
  {
    value: "87%",
    label: "Avg score",
    note: "Climbing steadily",
    progress: 87,
  },
  {
    value: "6",
    label: "Day streak",
    note: "Best run this month",
    progress: 60,
  },
  {
    value: "3",
    label: "Achievements",
    note: "Focus, accuracy, speed",
    progress: 48,
  },
]

const cards = [
  {
    title: "Mechanics & Waves",
    description: "Newton's laws, energy, and wave behavior with guided physics support.",
    route: "/physics/new",
    icon: "P",
    badge: "Physics",
    accent: "rgba(184, 48, 96, 0.08)",
    border: "rgba(184, 48, 96, 0.2)",
    progress: 62,
    footer: "62% · Chapter 4",
  },
  {
    title: "Algebra & Calculus",
    description: "Derivatives, integrals, and limits without losing the thread.",
    route: "/math/new",
    icon: "M",
    badge: "Math",
    accent: "rgba(253, 216, 53, 0.12)",
    border: "rgba(232, 155, 60, 0.28)",
    progress: 45,
    footer: "45% · Chapter 7",
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="app-shell sunrise-shell workspace-shell">
      <Sidebar />
      <main className="workspace-main">
        <div className="workspace-stage chat-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          <div className="dashboard-shell">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="dashboard-hero"
            >
              <div style={{ display: "grid", gap: "1rem", maxWidth: "44rem" }}>
                <span
                  className="badge-glow"
                  style={{
                    width: "fit-content",
                    background: "rgba(255,255,255,0.12)",
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#fff4dd",
                  }}
                >
                  Monday morning
                </span>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    style={{ color: "#fff6eb", fontSize: "clamp(2.3rem, 5vw, 3.8rem)", marginBottom: "0.7rem" }}
                  >
                    Good morning, Alex. Make this session <span className="sunrise-wordmark">Stellar</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    style={{ margin: 0, color: "rgba(255, 244, 230, 0.82)", lineHeight: 1.75, maxWidth: "38rem" }}
                  >
                    You have a Physics session in progress. Stella is ready whenever you are, with a clearer study flow.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem" }}
                >
                  <button type="button" className="btn-primary" onClick={() => navigate("/physics/new")}>
                    Ask Stella now
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => navigate("/progress")}>
                    View progress
                  </button>
                </motion.div>
              </div>

              <div
                aria-hidden="true"
                style={{
                  justifySelf: "end",
                  alignSelf: "start",
                  width: "5.5rem",
                  height: "5.5rem",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(145deg, rgba(255,255,255,0.28), rgba(184,48,96,0.3))",
                  boxShadow: "0 18px 38px rgba(97, 31, 23, 0.16)",
                  color: "#fff8f0",
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                AI
              </div>
            </motion.section>

            <section className="dashboard-stat-grid">
              {stats.map((stat, index) => (
                <motion.article
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.06 }}
                  className="academic-card"
                  style={{ padding: "1.1rem 1.2rem", display: "grid", gap: "0.55rem" }}
                >
                  <div style={{ display: "grid", gap: "0.15rem" }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "Fraunces, Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "2rem",
                        lineHeight: 1,
                        color: "var(--sr-wine)",
                        fontWeight: 800,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700 }}>{stat.label}</p>
                  </div>
                  <div className="progress-bar-track" style={{ height: "0.4rem", background: "rgba(184, 48, 96, 0.08)" }}>
                    <div className="progress-bar-fill" style={{ width: `${stat.progress}%` }} />
                  </div>
                  <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.82rem" }}>{stat.note}</p>
                </motion.article>
              ))}
            </section>

            <section className="dashboard-study-grid">
              {cards.map((card, index) => (
                <motion.section
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.08, duration: 0.45 }}
                  className="academic-card"
                  style={{
                    padding: "1.35rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    background: `linear-gradient(180deg, ${card.accent}, rgba(255,255,255,0.72))`,
                    borderColor: card.border,
                    minHeight: "12.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.9rem",
                      display: "grid",
                      placeItems: "center",
                      background: "var(--sr-btn-gradient)",
                      color: "#fff",
                      fontSize: card.icon.length > 1 ? "0.85rem" : "1.1rem",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ display: "grid", gap: "0.7rem" }}>
                    <span className="badge-glow" style={{ width: "fit-content", margin: 0 }}>
                      {card.badge}
                    </span>
                    <div>
                      <h2 style={{ fontSize: "1.45rem", marginBottom: "0.45rem" }}>{card.title}</h2>
                      <p style={{ margin: 0, color: "var(--sr-text-soft)", lineHeight: 1.7, fontSize: "0.93rem" }}>
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: "auto", display: "grid", gap: "0.6rem" }}>
                    <div className="progress-bar-track" style={{ height: "0.45rem", background: "rgba(184, 48, 96, 0.08)" }}>
                      <div className="progress-bar-fill" style={{ width: `${card.progress}%` }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                      <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.84rem" }}>{card.footer}</p>
                      <button
                        type="button"
                        className={card.badge === "RAG AI" ? "btn-secondary" : "btn-primary"}
                        onClick={() => navigate(card.route)}
                        style={{ width: "fit-content" }}
                      >
                        {card.badge === "RAG AI" ? "See progress" : "Open"}
                      </button>
                    </div>
                  </div>
                </motion.section>
              ))}
            </section>
          </div>
        </div>
        <Stella />
      </main>
      <AnalyticsPanel data={defaultAnalytics} />
    </div>
  )
}