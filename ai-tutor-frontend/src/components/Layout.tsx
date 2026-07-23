import type { ReactNode } from "react"
import AnalyticsPanel from "./AnalyticsPanel"
import type { AnalyticsData } from "./AnalyticsPanel"
import Sidebar from "./Sidebar"
import Stella from "./Stella"

type LayoutProps = {
  children: ReactNode
  analytics?: AnalyticsData
}

export default function Layout({ children, analytics }: LayoutProps) {
  return (
    <div className="app-shell sunrise-shell workspace-shell">
      <Sidebar />
      <main className="workspace-main">
        <div className="workspace-stage chat-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
        <Stella />
      </main>
      <AnalyticsPanel data={analytics} />
    </div>
  )
}
