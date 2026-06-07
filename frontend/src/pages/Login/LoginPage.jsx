import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginApi } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import './LoginPage.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await loginApi(form)
      login(data.token, { username: data.username, email: data.email, userId: data.userId })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero__content">
          <h1>🏰 Guild Manager</h1>
          <p>Recluta héroes, lanza aventuras épicas y conquista lo imposible.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="tu@email.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar al Gremio'}
            </button>
          </form>
          <p className="auth-link">¿No tienes cuenta? <Link to="/register">Registrarse</Link></p>
        </div>
      </div>
    </div>
  )
}
