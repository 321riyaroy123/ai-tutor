import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--surface-border)", padding: "2.5rem 0" }}>
      <div className="page-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1.2rem" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <span style={{
            fontFamily: "Playfair Display,Georgia,serif", fontSize: "1.1rem", fontWeight: 700,
            background: "var(--primary-gradient)", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Stella<span style={{ color: "var(--text-main)", WebkitTextFillColor: "var(--text-main)" }}>AI</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <Link to="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</Link>
          <Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>Login</Link>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
          © 2026 StellaAI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
