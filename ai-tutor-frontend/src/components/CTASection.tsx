import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"

export default function CTASection() {
  return (
    <section style={{ padding: "6rem 0" }}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundImage: "var(--primary-gradient)", borderRadius: "1.75rem",
            padding: "3.5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: "16rem", height: "16rem", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(48px)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: "12rem", height: "12rem", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(32px)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 10 }}>
            <div className="animate-bounce-gentle" style={{ width: "5.5rem", height: "5.5rem", margin: "0 auto 1.5rem", borderRadius: "50%", overflow: "hidden", border: "4px solid rgba(255,255,255,0.3)", background: "#fff" }}>
              <Lottie animationData={wingedTeacher} loop />
            </div>
            <h2 style={{ color: "#fff", fontSize: "2.4rem", marginBottom: "0.9rem", WebkitTextFillColor: "#fff" }}>
              Ready to Learn Smarter?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", maxWidth: "32rem", margin: "0 auto 2rem" }}>
              Join thousands of students already learning with Stella. Start your personalized journey today.
            </p>
            <Link to="/login">
              <button
                type="button"
                style={{
                  background: "#fff", color: "var(--text-main)", border: "none", borderRadius: "9999px",
                  padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}
              >
                Chat with Stella Now →
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
