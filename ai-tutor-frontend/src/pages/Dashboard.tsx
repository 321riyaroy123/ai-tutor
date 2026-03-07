import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"

type DashboardCard = {
  title:       string
  description: string
  route:       string
  icon:        string
}

const cards: DashboardCard[] = [
  {
    title:       "Physics Tutor",
    description: "Explore mechanics, fields, and conceptual reasoning with guided steps.",
    route:       "/physics/new",
    icon:        "⚛",
  },
  {
    title:       "Math Tutor",
    description: "Practice algebra, calculus, and proofs with clear explanations.",
    route:       "/math/new",
    icon:        "∑",
  },
  {
    title:       "Progress Tracker",
    description: "Review completion trends and confidence growth over recent sessions.",
    route:       "/progress",
    icon:        "◈",
  },
  {
    title:       "Settings",
    description: "Adjust dark mode, readable scaling, and dyslexia-friendly typography.",
    route:       "/settings",
    icon:        "⚙",
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Layout>
      <style>{`
        @keyframes gradientRotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .grad-btn {
          background: linear-gradient(135deg, #1C6FF8, #27BBE0, #ff39efff, #1C6FF8);
          background-size: 300% 300%;
          animation: gradientRotate 7s ease infinite;
          color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 0.42rem 1.1rem; border-radius: 0.65rem;
          border: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .grad-btn:hover  { opacity: 0.88; transform: scale(1.04) translateY(-1px); }
        .grad-btn:active { transform: scale(0.97); }
        .grad-icon {
          background: linear-gradient(135deg, #1C6FF8, #27BBE0, #ff39efff, #1C6FF8);
          background-size: 300% 300%;
          animation: gradientRotate 7s ease infinite;
        }
        .grad-ring {
          background: linear-gradient(135deg, #1C6FF8, #27BBE0, #ff39efff, #1C6FF8);
          background-size: 300% 300%;
          animation: gradientRotate 7s ease infinite;
        }
      `}</style>

      {/* Hero */}
      <div style={{ marginBottom: "1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38 }}
        >
          
          <h1 style={{ fontSize: "2.35rem", margin: "0 0 0.2rem", display: "flex", flexWrap: "wrap" }}>
            {"Welcome Back!".split("").map((char, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 2.2,
                  delay: i * 0.08,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  color: "#7f10e1e4",
                  display: "inline-block",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </h1>
          <p style={{ fontSize: "0.98rem", color: "var(--text-soft)", maxWidth: "460px", lineHeight: 1.5, margin: 0 }}>
            Stella is ready to help you study — professional, focused, and always at your pace.
          </p>
        </motion.div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="grad-ring"
            style={{ padding: "3px", borderRadius: "50%", boxShadow: "0 4px 20px rgba(28,111,248,0.35)" }}
          >
            <div
              style={{
                width: "70px", height: "70px", borderRadius: "50%",
                background: "var(--surface-0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem",
              }}
            >
              🎓
            </div>
          </div>
        </motion.div>
      </div>

      <div className="neon-divider" />

      {/* Card grid */}
      <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(2, 1fr)" }}>
        {cards.map((card, index) => (
          <motion.section
            key={card.title}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, delay: index * 0.07, ease: [0.34, 1.2, 0.64, 1] }}
            className="academic-card"
            style={{ padding: "1.2rem 1.3rem", display: "flex", flexDirection: "column" }}
          >
            <div style={{ marginBottom: "0.55rem", display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <span
                className="grad-icon"
                style={{
                  display: "flex", width: "38px", height: "38px",
                  alignItems: "center", justifyContent: "center",
                  borderRadius: "0.65rem", fontSize: "1.2rem", color: "#fff",
                  boxShadow: "0 2px 10px rgba(28,111,248,0.28)", flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{card.title}</h2>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-soft)", lineHeight: 1.5, flex: 1, marginBottom: "0.9rem" }}>
              {card.description}
            </p>

            <button
              type="button"
              onClick={() => navigate(card.route)}
              className="grad-btn"
              style={{ width: "fit-content" }}
            >
              Open →
            </button>
          </motion.section>
        ))}
      </div>
    </Layout>
  )
}
