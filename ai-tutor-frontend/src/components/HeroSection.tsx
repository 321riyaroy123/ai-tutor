import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"

export default function HeroSection() {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: "5rem" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "25%", left: "-8rem", width: "24rem", height: "24rem", borderRadius: "50%", background: "rgba(224,124,234,0.10)", filter: "blur(64px)" }} />
        <div style={{ position: "absolute", bottom: "25%", right: "-8rem", width: "24rem", height: "24rem", borderRadius: "50%", background: "rgba(124,140,255,0.10)", filter: "blur(64px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(142,240,196,0.07)", filter: "blur(64px)" }} />
      </div>

      <div className="page-container" style={{ position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gap: "3rem", alignItems: "center", gridTemplateColumns: "1fr" }} className="lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="badge-glow"
              style={{ marginBottom: "1.4rem", fontSize: "0.85rem" }}
            >
              ✨ Powered by Advanced AI
            </motion.div>

            <h1 style={{ fontSize: "3.2rem", lineHeight: 1.15, marginBottom: "1.2rem" }}>
              Learn with{" "}
              <span className="text-gradient-primary">Stella</span>
              <br />
              Your AI Tutor
            </h1>

            <p style={{ fontSize: "1.05rem", color: "var(--text-soft)", maxWidth: "32rem", marginBottom: "2rem", lineHeight: 1.6 }}>
              Get personalized tutoring in any subject. Stella adapts to your learning style,
              tracks your progress, and helps you master concepts faster.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Link to="/login">
                <button type="button" className="btn-primary" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
                  Start Learning Free →
                </button>
              </Link>
              <Link to="/login">
                <button type="button" className="btn-outline" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
                  View Dashboard
                </button>
              </Link>
            </div>

            <div style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <div style={{ display: "flex" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "2.4rem", height: "2.4rem", borderRadius: "50%",
                      border: "2px solid var(--surface-0)", marginLeft: i === 1 ? 0 : "-0.7rem",
                      backgroundImage: "var(--accent-gradient)",
                    }}
                  />
                ))}
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>10,000+ students</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>learning with Stella</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ position: "relative", display: "flex", justifyContent: "center" }}
            className="hidden lg:flex"
          >
            <div className="stella-ring float-bob" style={{ padding: "0.8rem", boxShadow: "0 8px 40px rgba(224,124,234,0.35)" }}>
              <div style={{ width: "280px", height: "280px", borderRadius: "50%", overflow: "hidden", background: "var(--surface-0)" }}>
                <Lottie animationData={wingedTeacher} loop />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="academic-card"
              style={{ position: "absolute", bottom: "-1rem", left: "-1rem", padding: "1rem 1.2rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <span className="online-dot" />
                <div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, margin: 0 }}>Stella</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--link-color)", margin: 0 }}>Online & ready</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
