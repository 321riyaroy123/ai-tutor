import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--sr-divider)", padding: "2rem 0 2.6rem" }}>
      <div className="page-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <Link to="/" style={{ textDecoration: "none", color: "var(--sr-text-ink)", fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 800, fontSize: "1.2rem" }}>
            StellaAI
          </Link>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.86rem", color: "var(--sr-text-muted)" }}>
            Sunrise design system for a calmer AI tutoring experience.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.9rem" }}>
          <Link to="/" style={{ textDecoration: "none", color: "var(--sr-text-soft)" }}>Home</Link>
          <Link to="/login" style={{ textDecoration: "none", color: "var(--sr-text-soft)" }}>Login</Link>
          <Link to="/register" style={{ textDecoration: "none", color: "var(--sr-text-soft)" }}>Register</Link>
        </div>

        <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--sr-text-muted)" }}>
          © 2026 StellaAI
        </p>
      </div>
    </footer>
  )
}
