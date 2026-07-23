import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function CTASection() {
  return (
    <section id="launch" style={{ padding: "0 0 5rem" }}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          style={{
            borderRadius: "1.75rem",
            overflow: "hidden",
            background: "var(--sr-bg-card)",
            border: "1px solid var(--sr-card-border)",
            boxShadow: "var(--sr-card-shadow)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={{ padding: "2rem" }}>
            <p style={{ margin: "0 0 0.4rem", color: "var(--sr-wine)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Ready to start
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "0.8rem" }}>
              Move from a pretty landing page into a working tutor flow.
            </h2>
            <p style={{ margin: "0 0 1.4rem", color: "var(--sr-text-soft)", lineHeight: 1.75 }}>
              The new frontend keeps your backend integration intact. Register, log in, start a subject chat, and track the session data without losing the current API behavior.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem" }}>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button type="button" className="btn-primary">Create account</button>
              </Link>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button type="button" className="btn-outline">Open workspace</button>
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "var(--sr-hero-gradient)",
              padding: "2rem",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)" }}>
              Workflow
            </p>
            <div style={{ display: "grid", gap: "0.9rem" }}>
              {["Sign in once", "Open Physics or Math", "Chat with Stella and review analytics"].map((step, index) => (
                <div key={step} style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "999px", background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center", fontWeight: 800 }}>
                    {index + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
