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
    <div className="app-shell" style={{ display:"flex", flexDirection:"row", minHeight:"100vh", width:"100%", alignItems:"stretch" }}>
      <Sidebar />
      <main style={{ flex:1, minWidth:0, position:"relative", overflowY:"auto", display:"flex", flexDirection:"column" }}>
        <div className="page-container chat-scrollbar animate-fade-up" style={{ flex:1 }}>{children}</div>
        <Stella />
      </main>
      <AnalyticsPanel data={analytics} />
    </div>
  )
}
