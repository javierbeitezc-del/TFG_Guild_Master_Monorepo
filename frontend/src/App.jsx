import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import AventurerosPage from './pages/Aventureros/AventurerosPage'
import GachaPage from './pages/Gacha/GachaPage'
import AventurasPage from './pages/Aventuras/AventurasPage'
import InventarioPage from './pages/Inventario/InventarioPage'
import MejorasPage from './pages/Mejoras/MejorasPage'

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="aventureros"  element={<AventurerosPage />} />
          <Route path="gacha"        element={<GachaPage />} />
          <Route path="aventuras"    element={<AventurasPage />} />
          <Route path="inventario"   element={<InventarioPage />} />
          <Route path="mejoras"      element={<MejorasPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
