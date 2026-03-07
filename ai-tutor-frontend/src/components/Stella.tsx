import Lottie from "lottie-react"
import wingedTeacher from "../assets/animations/stella.json"

export default function Stella() {
  return (
    <div
      className="fixed bottom-6 right-6 hidden md:block"
      aria-label="Stella AI tutor avatar"
    >
      {/* Outer glow ring */}
      <div className="stella-ring p-3 shadow-glow">
        <div className="w-24 overflow-hidden rounded-full">
          <Lottie animationData={wingedTeacher} loop />
        </div>
      </div>
    </div>
  )
}
