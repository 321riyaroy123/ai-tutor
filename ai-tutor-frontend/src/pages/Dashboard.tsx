import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import Layout from "../components/Layout"

type DashboardCard = {
  title: string
  description: string
  route: string
  icon: string
}

const cards: DashboardCard[] = [
  {
    title: "Physics Tutor",
    description: "Explore mechanics, fields, and conceptual reasoning with guided steps.",
    route: "/physics/new",
    icon: "\u269B",
  },
  {
    title: "Math Tutor",
    description: "Practice algebra, calculus, and proofs with clear explanations.",
    route: "/math/new",
    icon: "\u2211",
  },
  {
    title: "Progress Tracker",
    description: "Review completion trends and confidence growth over recent sessions.",
    route: "/progress",
    icon: "\u25C8",
  },
  {
    title: "Settings",
    description: "Adjust dark mode, readable scaling, and dyslexia-friendly typography.",
    route: "/settings",
    icon: "\u2699",
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div style={{ marginBottom: "1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38 }}
        >
          <h1 style={{ fontSize: "2.6rem", margin: "0 0 0.3rem" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-soft)", maxWidth: "460px", lineHeight: 1.5, margin: 0 }}>
            Stella is ready to help you study — professional, focused, and always at your pace.
          </p>
        </motion.div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="stella-ring"
            style={{ padding: "3px", borderRadius: "50%", boxShadow: "0 4px 20px rgba(224,124,234,0.35)" }}
          >
            <div
              style={{
                width: "70px", height: "70px", borderRadius: "50%",
                background: "var(--surface-0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {"\u{1F993}"}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="neon-divider" />

      <div style={{ display: "grid", gap: "1.1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {cards.map((card, index) => (
          <motion.section
            key={card.title}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, delay: index * 0.07, ease: [0.34, 1.2, 0.64, 1] }}
            className="academic-card"
            style={{ padding: "1.4rem 1.5rem", display: "flex", flexDirection: "column" }}
          >
            <div style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <span
                style={{
                  display: "flex", width: "44px", height: "44px",
                  alignItems: "center", justifyContent: "center",
                  borderRadius: "0.75rem", fontSize: "1.35rem", color: "#fff",
                  backgroundImage: "var(--primary-gradient)",
                  boxShadow: "0 2px 12px rgba(224,124,234,0.32)", flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              <h2 style={{ fontSize: "1.3rem", margin: 0 }}>{card.title}</h2>
            </div>

            <p style={{ fontSize: "0.92rem", color: "var(--text-soft)", lineHeight: 1.55, flex: 1, marginBottom: "1.1rem" }}>
              {card.description}
            </p>

            <button
              type="button"
              onClick={() => navigate(card.route)}
              className="btn-primary"
              style={{ width: "fit-content" }}
            >
              Open {"\u2192"}
            </button>
          </motion.section>
        ))}
      </div>
    </Layout>
  )
}
