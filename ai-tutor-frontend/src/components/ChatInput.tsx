import { useState } from "react"

interface Props {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function ChatInput({ onSend, placeholder = "Type a message...", disabled }: Props) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div
      className="academic-card"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.8rem",
        padding: "0.8rem",
        background: "var(--sr-bg-card-strong)",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--sr-text-ink)",
          fontFamily: "inherit",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          minHeight: "52px",
          maxHeight: "150px",
        }}
        aria-label="Chat message input"
      />
      <button
        type="button"
        className="btn-primary"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        style={{ padding: "0.8rem 1rem", minWidth: "4.2rem" }}
      >
        Send
      </button>
    </div>
  )
}
