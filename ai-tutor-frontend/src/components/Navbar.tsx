import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"

const navLinks = [
  { label: "Subjects", href: "#subjects" },
  { label: "Experience", href: "#experience" },
  { label: "Start", href: "#launch" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className="sunrise-topbar"
      style={{
        padding: scrolled ? "0.9rem 0" : "1.25rem 0",
        boxShadow: scrolled ? "0 10px 30px rgba(28,10,0,0.06)" : "none",
      }}
    >
      <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <Link to="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", gap: "0.15rem" }}>
          <span style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: "1.35rem", fontWeight: 800, color: "var(--sr-text-ink)" }}>
            StellaAI
          </span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sr-text-muted)" }}>
            Sunrise learning system
          </span>
        </Link>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: "1.4rem" }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ color: "var(--sr-text-soft)", textDecoration: "none", fontSize: "0.92rem", fontWeight: 600 }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <ThemeToggle compact />
          <Link to="/login" style={{ textDecoration: "none" }}>
            <button type="button" className="btn-primary">
              Start Learning
            </button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
