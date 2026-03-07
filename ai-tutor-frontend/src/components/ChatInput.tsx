import { useState } from "react"

interface Props {
  onSend:      (message: string) => void
  placeholder?: string
  disabled?:   boolean
}

export default function ChatInput({ onSend, placeholder = "Type a message…", disabled }: Props) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.75rem",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-border)",
        borderRadius: "1rem",
        padding: "0.6rem 0.75rem",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: "0.9rem",
          color: "var(--text-main)",
          fontFamily: "inherit",
          lineHeight: 1.5,
          maxHeight: "120px",
          overflowY: "auto",
        }}
        aria-label="Chat message input"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        style={{
          flexShrink: 0,
          width: "36px",
          height: "36px",
          borderRadius: "0.6rem",
          background: value.trim() && !disabled ? "var(--primary-gradient)" : "var(--surface-border)",
          border: "none",
          cursor: value.trim() && !disabled ? "pointer" : "not-allowed",
          color: "#fff",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.18s ease",
          opacity: value.trim() && !disabled ? 1 : 0.45,
        }}
      >
        ↑
      </button>
    </div>
  )
}
