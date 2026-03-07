import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import Layout from "../components/Layout"
import ChatInput from "../components/ChatInput"
import ChatMessage from "../components/ChatMessage"
import { defaultAnalytics } from "../components/AnalyticsPanel"
import type { AnalyticsData } from "../components/AnalyticsPanel"

type ChatRole = "user" | "assistant"
type ChatMessageType = { role: ChatRole; content: string }

export default function Physics() {
  const { chatId } = useParams()
  const navigate = useNavigate()

  // If the route param is literally "new", redirect to a real UUID session
  useEffect(() => {
    if (chatId === "new") {
      navigate(`/physics/${uuidv4()}`, { replace: true })
    }
  }, [chatId, navigate])

  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content: "Hello, I am your Physics tutor. What would you like to explore today?",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics)
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleSend = async (message: string) => {
    const token = localStorage.getItem("token")
    if (!token || !chatId || chatId === "new") return

    setMessages((prev) => [...prev, { role: "user", content: message }])
    setLoading(true)
    setAnalytics((prev) => ({ ...prev, isLoading: true }))

    const startTime = Date.now()

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(
        `${API_URL}/ask`,
        {
          user_id: chatId,
          question: message,
          subject: "physics",
          student_level: "intermediate",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
    <Layout analytics={analytics}>
      <h1 className="mb-6 text-3xl">Physics Tutor</h1>

      <div className="academic-card flex h-[75vh] flex-col">
        <div className="chat-scrollbar flex-1 overflow-y-auto p-6">
          {messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))}

          {loading && <ChatMessage role="assistant" content="Thinking..." />}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 pt-0">
          <ChatInput onSend={handleSend} placeholder="Ask a physics question..." />
        </div>
      </div>
    </Layout>
  )
}
