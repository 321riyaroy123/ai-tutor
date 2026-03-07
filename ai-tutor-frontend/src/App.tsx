import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Physics from "./pages/Physics"
import Math from "./pages/Math"
import Register from "./pages/Register"
import Progress from "./pages/Progress"
import Settings from "./pages/Settings"

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token")
  if (!token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/physics/:chatId"
          element={
            <PrivateRoute>
              <Physics />
            </PrivateRoute>
          }
        />
        <Route
          path="/math/:chatId"
          element={
            <PrivateRoute>
              <Math />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <Progress />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
