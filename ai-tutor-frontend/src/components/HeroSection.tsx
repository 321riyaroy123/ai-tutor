import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"

const stats = [
  { label: "Subjects", value: "Physics + Math" },
  { label: "Response style", value: "Warm, stepwise" },
  { label: "Available", value: "Any study session" },
]

export default function HeroSection() {
  return (
    <section style={{ padding: "3rem 0 5rem" }}>
      <div className="page-container">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "1.75rem",
            background: "var(--sr-hero-gradient)",
            boxShadow: "0 28px 70px rgba(28,10,0,0.18)",
            padding: "1.5rem",
          }}
        >
          <div className="star" style={{ top: "12%", left: "8%", width: "4px", height: "4px" }} />
          <div className="star" style={{ top: "18%", left: "28%", width: "3px", height: "3px", animationDelay: "0.5s" }} />
          <div className="star" style={{ top: "11%", right: "16%", width: "3px", height: "3px", animationDelay: "1s" }} />
          <div className="star" style={{ bottom: "22%", right: "9%", width: "4px", height: "4px", animationDelay: "1.4s" }} />

          <div
            style={{
              display: "grid",
              gap: "2rem",
              alignItems: "center",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ padding: "1.25rem 0.75rem 1.25rem 0.75rem" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="badge-glow"
                style={{ color: "var(--sr-gold)", borderColor: "rgba(253,216,53,0.35)", background: "rgba(253,216,53,0.1)", marginBottom: "1rem" }}
              >
                ✦ AI-powered tutoring for high schoolers
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.55 }}
                style={{ margin: "0 0 0.35rem", color: "rgba(255,255,255,0.8)", fontSize: "1rem", fontWeight: 500 }}
              >
                Stella makes you
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.6 }}
                style={{ color: "#fff", fontSize: "clamp(3.5rem, 8vw, 6rem)", marginBottom: "1rem" }}
              >
                <span className="sunrise-wordmark">Stellar</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.6 }}
                style={{ maxWidth: "34rem", margin: "0 0 1.75rem", color: "rgba(255,255,255,0.78)", fontSize: "1rem", lineHeight: 1.75 }}
              >
                Physics and Math, explained with clarity and warmth. Stella picks up right where you need help and keeps every session focused, calm, and encouraging.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.55 }}
                style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", marginBottom: "1.5rem" }}
              >
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <button type="button" className="btn-primary" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    ✦ Stella makes you stellar
                  </button>
                </Link>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <button type="button" className="btn-secondary" style={{ background: "#fff", color: "var(--sr-wine)" }}>
                    See how it works
                  </button>
                </Link>
              </motion.div>

              <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 + index * 0.08, duration: 0.5 }}
                    style={{
                      borderRadius: "1.05rem",
                      padding: "0.95rem 1rem",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    <p style={{ margin: "0 0 0.25rem", color: "rgba(255,255,255,0.62)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {stat.label}
                    </p>
                    <p style={{ margin: 0, color: "#fff", fontSize: "0.96rem", fontWeight: 700 }}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              style={{ display: "grid", gap: "1rem", justifyItems: "center" }}
            >
              <div className="stella-ring float-bob" style={{ padding: "0.75rem", boxShadow: "0 20px 40px rgba(0,0,0,0.22)" }}>
                <div
                  style={{
                    width: "min(320px, 78vw)",
                    height: "min(320px, 78vw)",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.96)",
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Lottie animationData={wingedTeacher} loop />
                </div>
              </div>

              <div
                style={{
                  width: "min(360px, 100%)",
                  padding: "1rem 1.1rem",
                  borderRadius: "1.1rem",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#fff",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <p style={{ margin: "0 0 0.2rem", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.65)" }}>
                      Live tutor mode
                    </p>
                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                      Explain first, then deepen
                    </p>
                  </div>
                  <span className="online-dot" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
