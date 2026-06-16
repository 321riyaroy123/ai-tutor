import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import ChatShell from "../components/ChatShell"
import ChatInput from "../components/ChatInput"
import ChatMessage from "../components/ChatMessage"
import { defaultAnalytics } from "../components/AnalyticsPanel"
import type { AnalyticsData } from "../components/AnalyticsPanel"
import { getApiBaseUrl } from "../lib/api"

type ChatRole = "user" | "assistant"
type ChatMessageType = { role: ChatRole; content: string }

export default function Math() {
  const { chatId } = useParams()
  const navigate = useNavigate()

  // If the route param is literally "new", redirect to a real UUID session
  useEffect(() => {
    if (chatId === "new") {
      navigate(`/math/${uuidv4()}`, { replace: true })
    }
  }, [chatId, navigate])

  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content: "Hello, I am your Math tutor. Which concept would you like to work on?",
    },
  ])
  const [recentTopics, setRecentTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics)
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleSend = async (message: string) => {
    const token = localStorage.getItem("token")
    if (!token || !chatId || chatId === "new") return

    setMessages((prev) => [...prev, { role: "user", content: message }])
    setRecentTopics((prev) => [message.slice(0, 40), ...prev].slice(0, 5))
    setLoading(true)
    setAnalytics((prev) => ({ ...prev, isLoading: true }))

    const startTime = Date.now()

    try {
      const apiUrl = getApiBaseUrl()
      const response = await axios.post(
        `${apiUrl}/ask`,
        {
          user_id: chatId,
          question: message,
          subject: "math",
          student_level: "intermediate",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      const elapsed = (Date.now() - startTime) / 1000

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.answer },
      ])

      setAnalytics({
        confidence: response.data.confidence ?? 0,
        modelUsed: response.data.model_used ?? "unknown",
        latency: response.data.latency_seconds ?? elapsed,
        tokensUsed: response.data.tokens_used ?? 0,
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to tutor. Please try again." },
      ])
      setAnalytics((prev) => ({ ...prev, isLoading: false }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Don't render until we have a real session UUID
  if (!chatId || chatId === "new") return null

  return (
    <ChatShell title="Math" recentTopics={recentTopics} analytics={analytics}>
      <div className="chat-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} content={msg.content} />
        ))}

        {loading && <ChatMessage role="assistant" content="Thinking..." />}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "0 2rem 1.5rem", maxWidth: "48rem", margin: "0 auto", width: "100%" }}>
        <ChatInput onSend={handleSend} placeholder="Ask a math question..." />
      </div>
    </ChatShell>
  )
}
