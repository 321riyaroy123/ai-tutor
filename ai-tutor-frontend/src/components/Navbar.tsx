import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.3s ease",
        padding: scrolled ? "0.75rem 0" : "1.25rem 0",
        background: scrolled ? "var(--surface-0)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--surface-border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 0, paddingBottom: 0 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <span style={{
            fontFamily: "Playfair Display,Georgia,serif", fontSize: "1.4rem", fontWeight: 700,
            background: "var(--primary-gradient)", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Stella<span style={{ color: "var(--text-main)", WebkitTextFillColor: "var(--text-main)" }}>AI</span>
          </span>
        </Link>

        <div style={{ display: "none", alignItems: "center", gap: "2rem" }} className="md:flex">
          <Link to="/" className="nav-item" style={{ background: "none" }}>Home</Link>
          <Link to="/dashboard" className="nav-item" style={{ background: "none" }}>Dashboard</Link>
        </div>

        <Link to="/login">
          <button type="button" className="btn-primary">Start Learning</button>
        </Link>
      </div>
    </nav>
  )
}
