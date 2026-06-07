import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import '../Login/LoginPage.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', nombreGremio: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await registerApi(form)
      login(data.token, { username: data.username, email: data.email, userId: data.userId })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({...form, [key]: e.target.value}) })

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero__content">
          <h1>🏰 Guild Manager</h1>
          <p>Funda tu gremio, recluta héroes legendarios y escribe tu historia.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <h2>Crear Cuenta</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Nombre de usuario</label>
              <input placeholder="GrandMaster" required minLength={3} maxLength={50} {...f('username')} /></div>
            <div className="form-group"><label>Email</label>
              <input type="email" placeholder="tu@email.com" required {...f('email')} /></div>
            <div className="form-group"><label>Contraseña</label>
              <input type="password" placeholder="Mín. 8 chars, mayúscula y número" required minLength={8} {...f('password')} /></div>
            <div className="form-group"><label>Nombre del Gremio (opcional)</label>
              <input placeholder="Los Inmortales" maxLength={80} {...f('nombreGremio')} /></div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Fundando gremio...' : 'Fundar Gremio'}
            </button>
          </form>
          <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  )
}
