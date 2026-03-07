import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"

const NAV_ITEMS = [
  { label: "Physics Tutor", icon: "⚛", to: "/physics/new" },
  { label: "Math Tutor",    icon: "∑", to: "/math/new"    },
  { label: "Progress",      icon: "◈", to: "/progress"    },
  { label: "Settings",      icon: "⚙", to: "/settings"    },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  const toggleDark = () => {
    const next = !dark; setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }
  return (
    <aside className="animate-slide-left" style={{ width:"220px", minWidth:"220px", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, padding:"1.1rem 0.85rem", background:"var(--surface-0)", borderRight:"1px solid var(--surface-border)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", zIndex:20, overflowY:"auto" }}>
      <div style={{ paddingLeft:"0.4rem", marginBottom:"0.9rem" }}>
        <NavLink
  to="/dashboard"
  style={{ textDecoration: "none" }}
>
  <span
      style={{
        fontFamily: "Merriweather,Georgia,serif",
        fontSize: "1.25rem",
        fontWeight: 700,
        background: "var(--primary-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "block",
        lineHeight: 1.2,
        cursor: "pointer",
        transition: "opacity 0.18s ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
    >
      AI Tutor
    </span>
  </NavLink>
      </div>
      <div className="neon-divider" />
      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:"0.15rem" }}>
        {NAV_ITEMS.map((item, i) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} style={{ animationDelay:`${i * 0.06}s` }}>
            <span style={{ fontSize:"1.05rem", width:"20px", textAlign:"center", flexShrink:0 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ paddingTop:"0.6rem" }}>
        <div className="neon-divider" />
        <button type="button" onClick={toggleDark} className="nav-item" style={{ width:"100%", cursor:"pointer", background:"none", border:"1px solid transparent" }}>
          <span style={{ fontSize:"1.05rem", width:"20px", textAlign:"center", flexShrink:0 }}>{dark ? "☀" : "☾"}</span>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <button type="button" onClick={() => { localStorage.removeItem("token"); navigate("/") }} className="nav-item"
          style={{ width:"100%", cursor:"pointer", background:"none", border:"1px solid transparent", color:"#ef4444" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none" }}>
          <span style={{ fontSize:"1.05rem", width:"20px", textAlign:"center", flexShrink:0 }}>↪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
