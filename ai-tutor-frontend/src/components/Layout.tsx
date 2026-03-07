import Sidebar from "./Sidebar.tsx"
import AnalyticsPanel from "./AnalyticsPanel.tsx"
import type { AnalyticsData } from "./AnalyticsPanel.tsx"
import Stella from "./Stella.tsx"

export default function Layout({ children, analytics }: { children: React.ReactNode; analytics?: AnalyticsData }) {
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
