import { motion } from "framer-motion"

const features = [
  {
    icon: "⚡",
    badge: "Physics",
    title: "Mechanics, waves, and fields",
    description: "Turn dense textbook ideas into guided conversation with worked reasoning instead of one-line answers.",
  },
  {
    icon: "∑",
    badge: "Math",
    title: "Algebra to calculus, step by step",
    description: "Stella slows down when needed, shows the structure of a solution, and helps you see why each move works.",
  },
  {
    icon: "🧠",
    badge: "Smart AI",
    title: "Confidence-aware tutoring",
    description: "Track response confidence, latency, and recent study themes so each session feels grounded and useful.",
  },
]

const principles = [
  "One bold gradient gesture, then calm readable surfaces everywhere else.",
  "Fraunces headlines for personality, Plus Jakarta Sans for clarity and stamina.",
  "Motion that feels intentional: twinkle, lift, reveal, and the Stellar wave-skew-glow wordmark.",
]

export default function FeaturesSection() {
  return (
    <section id="subjects" style={{ padding: "1rem 0 5rem" }}>
      <div className="page-container">
        <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.05fr)" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <p style={{ margin: "0 0 0.35rem", color: "var(--sr-wine)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Foundations
            </p>
            <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", marginBottom: "0.9rem" }}>
              Designed to feel bright, warm, and sharply focused.
            </h2>
            <p style={{ margin: "0 0 1.4rem", color: "var(--sr-text-soft)", maxWidth: "34rem", lineHeight: 1.75 }}>
              This redesign treats the landing page like a clear invitation and the study workspace like a calm instrument panel. The visual system stays expressive without getting in the student’s way.
            </p>
            <div className="academic-panel" style={{ padding: "1.3rem" }}>
              {principles.map((principle) => (
                <div key={principle} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start", padding: "0.75rem 0", borderBottom: principle === principles[principles.length - 1] ? "none" : "1px solid var(--sr-divider)" }}>
                  <span style={{ color: "var(--sr-wine)", fontWeight: 800 }}>✦</span>
                  <p style={{ margin: 0, color: "var(--sr-text-soft)", lineHeight: 1.65 }}>{principle}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div id="experience" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="academic-card"
                style={{ padding: "1.35rem", animation: "cardIn .6s ease both" }}
              >
                <div
                  style={{
                    width: "2.8rem",
                    height: "2.8rem",
                    borderRadius: "0.9rem",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "1.35rem",
                    background: "var(--sr-btn-gradient)",
                    color: "#fff",
                    marginBottom: "1rem",
                    boxShadow: "0 10px 22px rgba(184,48,96,0.2)",
                  }}
                >
                  {feature.icon}
                </div>
                <span className="badge-glow" style={{ marginBottom: "0.8rem" }}>
                  {feature.badge}
                </span>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.55rem" }}>{feature.title}</h3>
                <p style={{ margin: 0, color: "var(--sr-text-soft)", fontSize: "0.93rem", lineHeight: 1.7 }}>
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
