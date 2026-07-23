import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import Layout from "../components/Layout"
import { getApiBaseUrl } from "../lib/api"

interface SubjectStats {
  sessions: number
  questions: number
  studyMinutes: number
  confidence: number
  avgLatency: number
  recentTopics: string[]
  weakAreas: string[]
  strongAreas: string[]
  weeklyActivity: number[]
  topicFrequency: Record<string, number>
}

interface ProgressData {
  userId: string
  physics: SubjectStats
  math: SubjectStats
  overallStreak: number
  totalHours: number
  joinedAt: string
}

const emptySubject: SubjectStats = {
  sessions: 0,
  questions: 0,
  studyMinutes: 0,
  confidence: 0,
  avgLatency: 0,
  recentTopics: [],
  weakAreas: [],
  strongAreas: [],
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  topicFrequency: {},
}

const fallbackData: ProgressData = {
  userId: "-",
  physics: emptySubject,
  math: emptySubject,
  overallStreak: 0,
  totalHours: 0,
  joinedAt: "",
}

const pieColors = ["#7b3ff2", "#9d4eda", "#b83060", "#d8703d", "#f0982a", "#fdd835", "#f5caa5"]

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="academic-panel" style={{ padding: "1rem", textAlign: "center" }}>
      <p style={{ margin: "0 0 0.25rem", fontSize: "1.2rem", fontWeight: 800 }}>{value}</p>
      <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.8rem" }}>{label}</p>
    </div>
  )
}

function TagList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) {
    return <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.84rem" }}>No data yet.</p>
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            padding: "0.35rem 0.7rem",
            borderRadius: "999px",
            background: `${color}18`,
            color,
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function WeekBar({ counts }: { counts: number[] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  const max = Math.max(...counts, 1)
  return (
    <div style={{ display: "flex", gap: "0.45rem", alignItems: "flex-end", height: "84px" }}>
      {counts.map((count, index) => (
        <div key={`${days[index]}-${index}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
          <motion.div
            style={{
              width: "100%",
              borderRadius: "999px",
              background: "var(--sr-btn-gradient)",
            }}
            initial={{ height: 0 }}
            animate={{ height: `${18 + (count / max) * 50}px` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          />
          <span style={{ fontSize: "0.7rem", color: "var(--sr-text-muted)" }}>{days[index]}</span>
        </div>
      ))}
    </div>
  )
}

function TopicChart({ frequency }: { frequency: Record<string, number> }) {
  const entries = Object.entries(frequency)
  if (entries.length === 0) {
    return <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.84rem" }}>No topic data yet.</p>
  }

  const data = entries.map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={54} outerRadius={84} paddingAngle={3}>
          {data.map((_, index) => (
            <Cell key={index} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--sr-bg-card-strong)",
            border: "1px solid var(--sr-card-border)",
            borderRadius: "12px",
            color: "var(--sr-text-ink)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function SubjectReport({ label, icon, stats }: { label: string; icon: string; stats: SubjectStats }) {
  const confidence = Math.round(stats.confidence * 100)

  return (
    <section className="academic-card" style={{ padding: "1.4rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
        <div style={{ width: "3rem", height: "3rem", borderRadius: "1rem", background: "var(--sr-btn-gradient)", color: "#fff", display: "grid", placeItems: "center", fontSize: "1.2rem" }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.15rem" }}>{label}</h2>
          <p style={{ margin: 0, color: "var(--sr-text-muted)", fontSize: "0.84rem" }}>Performance report</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", marginBottom: "1rem" }}>
        <StatPill label="Sessions" value={stats.sessions} />
        <StatPill label="Questions" value={stats.questions} />
        <StatPill label="Study hours" value={(stats.studyMinutes / 60).toFixed(1)} />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "1rem" }}>
        <div className="academic-panel" style={{ padding: "1rem" }}>
          <p style={{ margin: "0 0 0.45rem", fontWeight: 700 }}>Confidence</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
            <span style={{ color: "var(--sr-text-muted)", fontSize: "0.84rem" }}>Current score</span>
            <span className="badge-glow">{confidence}%</span>
          </div>
          <div className="progress-bar-track">
            <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>

        <div className="academic-panel" style={{ padding: "1rem" }}>
          <p style={{ margin: "0 0 0.7rem", fontWeight: 700 }}>Weekly activity</p>
          <WeekBar counts={stats.weeklyActivity} />
        </div>
      </div>

      <div className="academic-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <p style={{ margin: "0 0 0.35rem", fontWeight: 700 }}>Topic distribution</p>
        <p style={{ margin: "0 0 0.75rem", color: "var(--sr-text-muted)", fontSize: "0.84rem" }}>
          Where your recent questions are clustering.
        </p>
        <TopicChart frequency={stats.topicFrequency} />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="academic-panel" style={{ padding: "1rem" }}>
          <p style={{ margin: "0 0 0.7rem", fontWeight: 700 }}>Recent topics</p>
          <TagList items={stats.recentTopics} color="#9d4eda" />
        </div>
        <div className="academic-panel" style={{ padding: "1rem" }}>
          <p style={{ margin: "0 0 0.7rem", fontWeight: 700 }}>Needs more practice</p>
          <TagList items={stats.weakAreas} color="#d8703d" />
        </div>
        <div className="academic-panel" style={{ padding: "1rem" }}>
          <p style={{ margin: "0 0 0.7rem", fontWeight: 700 }}>Strong areas</p>
          <TagList items={stats.strongAreas} color="#b83060" />
        </div>
      </div>
    </section>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const [data, setData] = useState<ProgressData>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    let cancelled = false

    const loadProgress = async () => {
      try {
        const apiUrl = getApiBaseUrl()
        const res = await axios.get<ProgressData>(`${apiUrl}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return
        setData({
          ...fallbackData,
          ...res.data,
          physics: { ...emptySubject, ...res.data.physics },
          math: { ...emptySubject, ...res.data.math },
        })
      } catch {
        if (!cancelled) setError("Could not load progress data.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProgress()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const totalQuestions = data.physics.questions + data.math.questions

  return (
    <Layout>
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 0.3rem", color: "var(--sr-wine)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Progress
            </p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginBottom: "0.45rem" }}>Your learning report</h1>
            <p style={{ margin: 0, color: "var(--sr-text-soft)", maxWidth: "42rem" }}>
              Review confidence, session patterns, and subject-specific momentum in one place.
            </p>
            {error && <p style={{ margin: "0.55rem 0 0", color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}
          </div>
        </div>
      </motion.section>

      <section className="academic-card" style={{ padding: "1.3rem", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gap: "0.8rem", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          <StatPill label="Streak" value={loading ? "..." : `${data.overallStreak}d`} />
          <StatPill label="Study hours" value={loading ? "..." : `${data.totalHours}h`} />
          <StatPill label="Questions" value={loading ? "..." : totalQuestions} />
          <StatPill label="Subjects" value={loading ? "..." : "Physics + Math"} />
        </div>
      </section>

      {loading ? (
        <div className="academic-card" style={{ padding: "2rem", textAlign: "center", color: "var(--sr-text-muted)" }}>
          Loading your progress...
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          <SubjectReport label="Physics Tutor" icon="⚡" stats={data.physics} />
          <SubjectReport label="Math Tutor" icon="∑" stats={data.math} />
        </div>
      )}
    </Layout>
  )
}
