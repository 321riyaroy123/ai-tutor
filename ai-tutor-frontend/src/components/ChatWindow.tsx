import { useState } from "react"
import axios from "axios"
import Lottie from "lottie-react"
import loadingAnim from "../assets/animations/stella.json"
import { motion } from "framer-motion"

export default function ChatWindow({ subject }: { subject: string }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    setLoading(true)

    const newMessages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...messages,
      { role: "user", content: input },
    ]
    setMessages(newMessages)

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await axios.post(`${API_URL}/ask`, {
        question: input,
        subject,
      })

      setMessages([...newMessages, { role: "assistant", content: res.data.answer }])
      setInput("")
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Please retry." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="chat-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl max-w-lg ${msg.role === "user"
                ? "ml-auto text-white"
                : "academic-panel"
              }`}
            style={msg.role === "user" ? { backgroundImage: "var(--primary-gradient)" } : undefined}
          >
            {msg.content}
          </motion.div>
        ))}

        {loading && (
          <div className="w-32">
            <Lottie animationData={loadingAnim} loop />
          </div>
        )}
      </div>

      <div className="academic-panel flex gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field-base flex-1"
          placeholder="Ask something..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage()
          }}
        />
        <button
          onClick={sendMessage}
          className="btn-primary px-6"
        >
          Send
        </button>
      </div>
    </div>
  )
}
