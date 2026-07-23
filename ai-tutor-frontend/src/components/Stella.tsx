import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"

export default function Stella() {
  return (
    <div
      className="fixed bottom-6 right-6 hidden md:block"
      aria-label="Stella AI tutor avatar"
    >
      <div
        className="stella-ring"
        style={{ padding: "0.55rem", boxShadow: "0 18px 36px rgba(184,48,96,0.2)" }}
      >
        <div style={{ width: "5.8rem", overflow: "hidden", borderRadius: "999px", background: "var(--sr-bg-card-strong)" }}>
          <Lottie animationData={wingedTeacher} loop />
        </div>
      </div>
    </div>
  )
}
