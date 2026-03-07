import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import ThemeToggle from "../components/ThemeToggle"

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Defaults ─────────────────────────────────────────────────────────────────

const emptySubject: SubjectStats = {
  sessions: 0, questions: 0, studyMinutes: 0,
  confidence: 0, avgLatency: 0,
  recentTopics: [], weakAreas: [], strongAreas: [],
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  topicFrequency: {},
}

const fallbackData: ProgressData = {
  userId: "—", overallStreak: 0, totalHours: 0, joinedAt: "",
  physics: emptySubject, math: emptySubject,
}

// ── Palette for pie slices ────────────────────────────────────────────────────

const PIE_COLORS = [
  "#1c6ff8", "#27bbe0", "#31db92", "#ffd639",
  "#9bfa24", "#fd9346", "#ff6200", "#b388ff",
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="academic-panel p-3 text-center">
      <p className="text-xl font-bold text-[var(--title-accent)]">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  )
}

function ConfidenceBar({
  value,
  gradient,
  delay = 0,
}: {
  value: number
  gradient: string
  delay?: number
}) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? "#31db92" : pct >= 45 ? "#ffd639" : "#fd9346"

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-semibold">Confidence Score</p>
        <span className="badge-glow" style={{ color }}>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundImage: gradient }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        {pct >= 70
          ? "Strong grasp of topics covered"
          : pct >= 45
            ? "Building understanding — keep going"
            : "Early stage — more practice will help"}
      </p>
    </div>
  )
}

function WeekBar({ counts }: { counts: number[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const max = Math.max(...counts, 1)
  return (
    <div className="flex items-end gap-1.5 h-14">
      {counts.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            className="w-full rounded-sm"
            style={{ backgroundImage: "var(--primary-gradient)" }}
            initial={{ height: 0 }}
            animate={{ height: `${(c / max) * 48}px` }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
          />
          <span className="text-[9px] text-[var(--text-muted)]">{days[i]}</span>
        </div>
      ))}
    </div>
  )
}

function TagList({ items, color }: { items: string[]; color: string }) {
  if (!items.length)
    return <p className="text-xs text-[var(--text-muted)] italic">None recorded yet</p>
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
          style={{ background: color + "22", color }}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

function TopicPieChart({
  topicFrequency,
  accentColor,
}: {
  topicFrequency: Record<string, number>
  accentColor: string
}) {
  const entries = Object.entries(topicFrequency)

  if (entries.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)] italic py-4 text-center">
        No topic data yet — start asking questions!
      </p>
    )
  }

  const data = entries.map(([name, value]) => ({
    name: name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    value,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
              opacity={0.9}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--text-primary)",
          }}
          formatter={(value, name) => {
            const safeValue = typeof value === "number" ? value : 0
            return [
              `${safeValue} question${safeValue !== 1 ? "s" : ""}`,
              name
            ]
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Subject Meta ──────────────────────────────────────────────────────────────

const subjectMeta = {
  physics: {
    icon: "⚛",
    label: "Physics",
    primaryGradient: "linear-gradient(90deg, #1c6ff8, #27bbe0, #31db92)",
    accentColor: "#27BBE0",
    weakColor: "#FD9346",
    strongColor: "#31DB92",
  },
  math: {
    icon: "∑",
    label: "Math",
    primaryGradient: "linear-gradient(90deg, #ffd639, #9bfa24, #27bbe0)",
    accentColor: "#FFD639",
    weakColor: "#FF6200",
    strongColor: "#9BFA24",
  },
} as const

// ── Subject Report Card ───────────────────────────────────────────────────────

function SubjectReport({
  subject,
  stats,
  index,
}: {
  subject: keyof typeof subjectMeta
  stats: SubjectStats
  index: number
}) {
  const meta = subjectMeta[subject]
  const studyH = Math.round((stats.studyMinutes / 60) * 10) / 10

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.12 }}
      className="academic-card p-6 col-span-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ backgroundImage: meta.primaryGradient, color: "#fff" }}
        >
          {meta.icon}
        </span>
        <div>
          <h2 className="text-2xl">{meta.label} Tutor</h2>
          <p className="text-xs text-[var(--text-muted)]">Personalised performance report</p>
        </div>
      </div>

      <div className="neon-divider mb-5" />

      {/* Top stat row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatPill label="Sessions" value={stats.sessions} />
        <StatPill label="Questions Asked" value={stats.questions} />
        <StatPill label="Study Time" value={`${studyH}h`} />
      </div>

      {/* Confidence + weekly split */}
      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        <div className="academic-panel p-4">
          <ConfidenceBar
            value={stats.confidence}
            gradient={meta.primaryGradient}
            delay={0.2 + index * 0.1}
          />
        </div>
        <div className="academic-panel p-4">
          <p className="text-sm font-semibold mb-3">Weekly Activity</p>
          <WeekBar counts={stats.weeklyActivity} />
        </div>
      </div>

      {/* Topic distribution pie */}
      <div className="academic-panel p-4 mb-6">
        <p className="text-sm font-semibold mb-1">Topic Distribution</p>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Breakdown of topics you have asked about in this subject
        </p>
        <TopicPieChart
          topicFrequency={stats.topicFrequency}
          accentColor={meta.accentColor}
        />
      </div>

      {/* Recent topics + weak + strong */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="academic-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)] mb-2">
            Recently Studied
          </p>
          <TagList items={stats.recentTopics} color={meta.accentColor} />
        </div>
        <div className="academic-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)] mb-2">
            Needs More Practice
          </p>
          <TagList items={stats.weakAreas} color={meta.weakColor} />
          {stats.weakAreas.length > 0 && (
            <p className="mt-2 text-[10px] text-[var(--text-muted)] italic">
              Based on sessions where confidence was below 55%
            </p>
          )}
        </div>
        <div className="academic-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)] mb-2">
            Strong Areas
          </p>
          <TagList items={stats.strongAreas} color={meta.strongColor} />
          {stats.strongAreas.length > 0 && (
            <p className="mt-2 text-[10px] text-[var(--text-muted)] italic">
              Based on sessions where confidence was 75%+
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Progress() {
  const navigate = useNavigate()
  const [data, setData] = useState<ProgressData>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/"); return }

    let cancelled = false

    const loadProgress = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await axios.get<ProgressData>(`${API_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return

        const payload = res.data
        if (!payload || typeof payload !== "object") throw new Error("Invalid payload")

        setData({
          ...fallbackData,
          ...payload,
          physics: { ...emptySubject, ...payload.physics },
          math: { ...emptySubject, ...payload.math },
        })
      } catch {
        if (!cancelled) {
          setError("Could not load progress data — showing last known state.")
          setData(fallbackData)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProgress()
    return () => { cancelled = true }
  }, [navigate])

  const totalQuestions = data.physics.questions + data.math.questions

  return (
    <div className="app-shell page-container">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Progress Tracker</h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            Your personalised learning report — updated after every session.
          </p>
          {error && (
            <p className="mt-1 text-xs text-[var(--text-muted)] italic">{error}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-outline" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Overall summary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="academic-card p-6 mb-6"
      >
        <h2 className="text-xl mb-4">Overall Summary</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill label="Study Streak" value={loading ? "…" : `${data.overallStreak}d`} />
          <StatPill label="Total Study Time" value={loading ? "…" : `${data.totalHours}h`} />
          <StatPill label="Total Questions" value={loading ? "…" : totalQuestions} />
          <StatPill label="Subjects Active" value={loading ? "…" :
            [data.physics.sessions > 0 && "Physics", data.math.sessions > 0 && "Math"]
              .filter(Boolean).join(" + ") || "—"
          } />
        </div>
      </motion.section>

      {/* Per-subject reports */}
      {loading ? (
        <div className="academic-card p-10 text-center text-[var(--text-muted)] animate-pulse">
          Loading your progress…
        </div>
      ) : (
        <div className="grid gap-6">
          <SubjectReport subject="physics" stats={data.physics} index={0} />
          <SubjectReport subject="math" stats={data.math} index={1} />
        </div>
      )}
    </div>
  )
}