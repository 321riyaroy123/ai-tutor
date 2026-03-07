import { motion, AnimatePresence } from "framer-motion"

export interface AnalyticsData {
  confidence:  number
  modelUsed:   string
  latency:     number
  tokensUsed:  number
  isLoading:   boolean
  lastUpdated: Date | null
}

export const defaultAnalytics: AnalyticsData = {
  confidence:  0,
  modelUsed:   "—",
  latency:     0,
  tokensUsed:  0,
  isLoading:   false,
  lastUpdated: null,
}

interface Props {
  data?: AnalyticsData
}

function StatRow({ label, value, delay=0 }: { label:string; value:string; delay?:number }) {
  return (
    <motion.div initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.3, delay }} style={{ marginBottom:"0.85rem" }}>
      <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", marginBottom:"0.15rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
      <p style={{ fontSize:"1rem", fontWeight:700, color:"var(--text-main)" }}>{value}</p>
    </motion.div>
  )
}

export default function AnalyticsPanel({ data }: { data?: AnalyticsData }) {
  const d = data ?? defaultAnalytics
  const confPct = Math.round(d.confidence * 100)
  const confColor = confPct >= 70 ? "#31db92" : confPct >= 45 ? "#ffd639" : "var(--text-muted)"
  return (
    <aside className="animate-slide-right" style={{ width:"220px", minWidth:"220px", height:"100vh", position:"sticky", top:0, padding:"1.1rem 0.85rem", background:"var(--surface-0)", borderLeft:"1px solid var(--surface-border)", backdropFilter:"blur(20px)", zIndex:20, overflowY:"auto", display:"flex", flexDirection:"column" }}>
      <div style={{ marginBottom:"0.85rem" }}>
        <span style={{ fontFamily:"Merriweather,Georgia,serif", fontSize:"1rem", fontWeight:700, background:"var(--primary-gradient)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", display:"block", lineHeight:1.2 }}>Response Analytics</span>
        <p style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginTop:"0.2rem" }}>Live session stats</p>
      </div>
      <div className="neon-divider" />
      <div style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.4rem" }}>
          <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Confidence</p>
          <motion.span key={confPct} initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="badge-glow" style={{ color:confColor, fontSize:"0.78rem" }}>{confPct}%</motion.span>
        </div>
        <div className="progress-bar-track">
          <motion.div style={{ height:"8px", borderRadius:"99px", background:"linear-gradient(90deg,#1c6ff8,#27bbe0,#31db92,#27bbe0,#1c6ff8)", backgroundSize:"200% 100%", animation:confPct>0?"progressShimmer 3s linear infinite":"none" }} initial={{ width:0 }} animate={{ width:`${confPct}%` }} transition={{ duration:1, ease:[0.34,1.2,0.64,1] }} />
        </div>
      </div>
      <StatRow label="Model Used"  value={d.modelUsed && d.modelUsed!=="unknown" ? d.modelUsed : "—"} delay={0.05} />
      <StatRow label="Latency"     value={d.latency>0 ? `${d.latency.toFixed(2)}s` : "—"}             delay={0.10} />
      <StatRow label="Tokens Used" value={d.tokensUsed>0 ? d.tokensUsed.toLocaleString() : "—"}       delay={0.15} />
      <AnimatePresence>
        {d.isLoading && (
          <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} style={{ display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.82rem", color:"var(--link-color)", fontWeight:600, marginBottom:"0.75rem" }}>
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            <span style={{ marginLeft:"0.25rem" }}>Processing</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ flex:1 }} />
      <div className="neon-divider" />
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.875rem", color:"var(--text-soft)", fontWeight:600 }}>
        <span className="online-dot" />Tutor online
      </div>
    </aside>
  )
}