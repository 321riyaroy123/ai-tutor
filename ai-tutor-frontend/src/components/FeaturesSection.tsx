import { motion } from "framer-motion"

const FEATURES = [
  { icon: "\u{1F9E0}", title: "Adaptive Learning",   description: "Stella adjusts difficulty and style based on how you learn, ensuring optimal progress." },
  { icon: "\u{1F4AC}", title: "Interactive Chat",     description: "Ask questions naturally. Stella explains complex topics in simple, digestible steps." },
  { icon: "\u{1F4D6}", title: "Lesson Library",       description: "Browse curated lessons across subjects \u2014 math, physics, and more." },
  { icon: "\u{1F4CA}", title: "Progress Tracking",    description: "Visual dashboards show your growth, streaks, and areas for improvement." },
  { icon: "\u{1F3AF}", title: "Goal Setting",         description: "Set learning goals and milestones. Stella keeps you accountable and motivated." },
  { icon: "\u{1F4A1}", title: "Smart Confidence Scoring", description: "Every answer comes with a confidence score so you know what to revisit." },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function FeaturesSection() {
  return (
    <section style={{ padding: "6rem 0", position: "relative" }}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          <h2 style={{ fontSize: "2.6rem", marginBottom: "0.8rem" }}>
            Everything You Need to{" "}
            <span className="text-gradient-primary">Excel</span>
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: "36rem", margin: "0 auto" }}>
            Stella combines cutting-edge AI with proven educational methods to create
            the perfect learning experience.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="academic-card"
              style={{ padding: "1.6rem" }}
            >
              <span
                style={{
                  display: "inline-flex", width: "3rem", height: "3rem", alignItems: "center",
                  justifyContent: "center", borderRadius: "0.9rem", fontSize: "1.4rem",
                  backgroundImage: "var(--primary-gradient)", marginBottom: "1rem",
                  boxShadow: "0 4px 16px rgba(224,124,234,0.30)",
                }}
              >
                {feature.icon}
              </span>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>{feature.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-soft)", lineHeight: 1.55, margin: 0 }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
