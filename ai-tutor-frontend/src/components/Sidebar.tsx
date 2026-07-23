import { NavLink, useNavigate } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"

const navGroups = [
  [
    { label: "Dashboard", icon: "D", to: "/dashboard" },
    { label: "Chat", icon: "C", to: "/physics/new" },
    { label: "Analytics", icon: "A", to: "/progress" },
  ],
  [
    { label: "Physics", icon: "P", to: "/physics/new" },
    { label: "Math", icon: "M", to: "/math/new" },
  ],
  [
    { label: "Settings", icon: "S", to: "/settings" },
  ],
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <div className="workspace-sidebar workspace-sidebar-sunrise">
      <div style={{ display: "grid", gap: "1.4rem", minHeight: "100%" }}>
        <div style={{ display: "grid", gap: "1.1rem" }}>
          <NavLink
            to="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: "0.8rem", textDecoration: "none", color: "#fff8ef" }}
          >
            <span className="sidebar-brand-mark">AI</span>
            <span style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: "1.65rem", fontWeight: 800 }}>
              Stella<span style={{ fontSize: "1rem", opacity: 0.85, marginLeft: "0.15rem" }}>AI</span>
            </span>
          </NavLink>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255, 244, 230, 0.8)", lineHeight: 1.65 }}>
            A warmer study workspace for Physics, Math, and guided progress.
          </p>
        </div>

        <nav style={{ display: "grid", gap: "1rem" }}>
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="sidebar-nav-group">
              {group.map((item) => (
                <NavLink key={item.to + item.label} to={item.to} className={({ isActive }) => `nav-item nav-item-sunrise${isActive ? " active" : ""}`}>
                  <span className="nav-item-mark" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: "auto", display: "grid", gap: "0.85rem" }}>
          <div className="sidebar-status-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <span className="sidebar-brand-mark" style={{ width: "2.4rem", height: "2.4rem", fontSize: "0.72rem" }}>
                AI
              </span>
              <div>
                <p style={{ margin: "0 0 0.12rem", fontWeight: 800, color: "#fff8ef" }}>Stella online</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <span className="online-dot" />
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255, 244, 230, 0.82)" }}>Ready for your next session</p>
                </div>
              </div>
            </div>
          </div>

          <ThemeToggle />
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              localStorage.removeItem("token")
              navigate("/login")
            }}
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "#fff6eb", background: "rgba(255,255,255,0.08)" }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
