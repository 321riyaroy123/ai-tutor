import { AnimatePresence, motion } from "framer-motion"

export interface AnalyticsData {
  confidence: number
  modelUsed: string
  latency: number
  tokensUsed: number
  isLoading: boolean
  lastUpdated: Date | null
}

export const defaultAnalytics: AnalyticsData = {
  confidence: 0,
  modelUsed: "-",
  latency: 0,
  tokensUsed: 0,
  isLoading: false,
  lastUpdated: null,
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="academic-panel" style={{ padding: "0.95rem" }}>
      <p style={{ margin: "0 0 0.2rem", fontSize: "0.72rem", color: "var(--sr-text-muted)", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{value}</p>
    </div>
  )
}

export default function AnalyticsPanel({ data }: { data?: AnalyticsData }) {
  const d = data ?? defaultAnalytics
  const confidence = Math.round(d.confidence * 100)

  return (
    <aside className="workspace-analytics">
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ margin: "0 0 0.25rem", color: "var(--sr-wine)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Session analytics
        </p>
        <h2 style={{ fontSize: "1.45rem", marginBottom: "0.35rem" }}>Tutor response panel</h2>
        <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--sr-text-muted)", lineHeight: 1.6 }}>
          Live confidence and performance stats for the current conversation.
        </p>
      </div>

      <div className="academic-card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "0.55rem" }}>
          <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "var(--sr-text-soft)" }}>Confidence</p>
          <span className="badge-glow">{confidence}%</span>
        </div>
        <div className="progress-bar-track" style={{ marginBottom: "0.65rem" }}>
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--sr-text-muted)", lineHeight: 1.6 }}>
          Stella reports how confident the current answer is, so you can revisit uncertain areas quickly.
        </p>
      </div>

      <div style={{ display: "grid", gap: "0.8rem" }}>
        <StatCard label="Model" value={d.modelUsed && d.modelUsed !== "unknown" ? d.modelUsed : "-"} />
        <StatCard label="Latency" value={d.latency > 0 ? `${d.latency.toFixed(2)}s` : "-"} />
        <StatCard label="Tokens" value={d.tokensUsed > 0 ? d.tokensUsed.toLocaleString() : "-"} />
      </div>

      <AnimatePresence>
        {d.isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="academic-panel"
            style={{ padding: "0.9rem", marginTop: "1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <p style={{ margin: 0, color: "var(--sr-text-soft)", fontSize: "0.84rem" }}>
              Stella is preparing a response.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
        <div className="neon-divider" style={{ marginBottom: "1rem" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "var(--sr-text-soft)", fontWeight: 700 }}>
          <span className="online-dot" />
          Tutor online
        </div>
      </div>
    </aside>
  )
}
