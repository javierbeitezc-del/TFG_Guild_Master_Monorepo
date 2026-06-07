import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: '🏰', label: 'Gremio' },
  { to: '/aventureros', icon: '⚔️',  label: 'Aventureros' },
  { to: '/gacha',       icon: '🎰', label: 'Reclutamiento' },
  { to: '/aventuras',   icon: '🗺️', label: 'Aventuras' },
  { to: '/inventario',  icon: '🎒', label: 'Inventario' },
  { to: '/mejoras',     icon: '⬆️',  label: 'Mejoras' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🏰</span>
          <span className="logo-text">Guild Manager</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.username}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">Salir</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
