import { useState, useEffect, useCallback } from 'react'
import { getAventuras, iniciarAventura, reclamarRecompensa } from '../../services/aventuraService'
import { getAventureros } from '../../services/aventureroService'
import { getGremio } from '../../services/gremioService'
import AventureroCard from '../../components/common/AventureroCard'
import './AventurasPage.css'

function CountDown({ segundos }) {
  // Fuente de verdad: segundosRestantes lo calcula el backend (servidor vs servidor),
  // asi que es inmune a la zona horaria y al desfase del reloj del cliente.
  // Aqui solo lo decrementamos localmente cada segundo.
  const [rem, setRem] = useState(Math.max(0, Math.floor(segundos ?? 0)))

  useEffect(() => {
    setRem(Math.max(0, Math.floor(segundos ?? 0)))
    const interval = setInterval(() => {
      setRem(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [segundos])

  if (rem <= 0) return <span style={{color:'var(--success)'}}>¡Lista!</span>
  const h = Math.floor(rem / 3600)
  const m = Math.floor((rem % 3600) / 60)
  const s = rem % 60
  return (
    <span>
      {h > 0 && `${h}h `}{m}m {String(s).padStart(2,'0')}s
    </span>
  )
}

function NuevaAventuraModal({ aventureros, gremio, onClose, onCrear }) {
  const [dificultad, setDificultad] = useState(1)
  const [seleccionados, setSeleccionados] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const libres = aventureros.filter(a => !a.enAventura)
  const oroEst = Math.round(50 * dificultad * 1.25)
  const expEst = Math.round(30 * dificultad)

  const toggle = (id) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev)

  const handleCrear = async () => {
    if (seleccionados.length === 0) { setError('Selecciona al menos 1 aventurero'); return }
    setLoading(true); setError('')
    try {
      await iniciarAventura({ dificultad, aventureroIds: seleccionados })
      onCrear()
      onClose()
    } catch (e) { setError(e.response?.data?.error || 'Error al iniciar') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{width:600}} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{fontSize:'1.2rem',marginBottom:'1.2rem'}}>🗺️ Nueva Aventura</h2>

        <div style={{marginBottom:'1.2rem'}}>
          <label style={{fontSize:13,color:'var(--text-secondary)',display:'block',marginBottom:6}}>
            Dificultad: <strong style={{color:'var(--accent-gold)'}}>{dificultad}</strong>
            <span style={{color:'var(--text-muted)',fontSize:12,marginLeft:8}}>~{oroEst}🪙 · {expEst} XP</span>
          </label>
          <input type="range" min={1} max={Math.max(1, gremio?.dificultadMax + 1 || 10)}
            value={dificultad} onChange={e => setDificultad(Number(e.target.value))}
            style={{width:'100%',accentColor:'var(--accent-gold)'}} />
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text-muted)'}}>
            <span>1 (Fácil)</span><span>{Math.max(1, (gremio?.dificultadMax || 0) + 1)}+ (Desafío)</span>
          </div>
        </div>

        <div style={{marginBottom:'0.6rem',fontSize:13,color:'var(--text-secondary)'}}>
          Selecciona equipo ({seleccionados.length}/5):
        </div>
        {libres.length === 0
          ? <p style={{color:'var(--text-muted)',textAlign:'center',padding:'1rem'}}>No hay aventureros disponibles</p>
          : <div className="grid-3" style={{maxHeight:320,overflowY:'auto',paddingRight:4}}>
              {libres.map(av => (
                <AventureroCard key={av.id} av={av}
                  selected={seleccionados.includes(av.id)}
                  onClick={() => toggle(av.id)} />
              ))}
            </div>
        }

        {error && <div className="error-msg" style={{marginTop:8}}>{error}</div>}
        <div style={{display:'flex',gap:8,marginTop:'1rem',justifyContent:'flex-end'}}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleCrear} disabled={loading || seleccionados.length === 0}>
            {loading ? 'Iniciando...' : '⚔️ Iniciar Aventura'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AventurasPage() {
  const [aventuras, setAventuras] = useState([])
  const [aventureros, setAventureros] = useState([])
  const [gremio, setGremio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [fetchedAt, setFetchedAt] = useState(() => Date.now())

  const fetchData = useCallback(async () => {
    const [aRes, avRes, gRes] = await Promise.all([getAventuras(), getAventureros(), getGremio()])
    setAventuras(aRes.data)
    setAventureros(avRes.data)
    setGremio(gRes.data)
    setFetchedAt(Date.now())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Tick local cada segundo para reevaluar qué aventuras han agotado su tiempo,
  // sin hacer polling al backend.
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(i)
  }, [])

  // "Terminada" si el backend ya la marcó COMPLETADA, o si su tiempo se ha agotado
  // (segundosRestantes desde la última carga, con +1s de margen). El backend valida
  // de nuevo el tiempo al reclamar, así que esto no permite reclamar antes de hora.
  const haTerminado = (a) => {
    if (a.estado === 'COMPLETADA') return true
    if (a.estado === 'EN_CURSO') {
      const transcurrido = (Date.now() - fetchedAt) / 1000
      return transcurrido >= (a.segundosRestantes ?? 0) + 1
    }
    return false
  }

  const handleReclamar = async (id) => {
    await reclamarRecompensa(id)
    fetchData()
  }

  const activas = aventuras.filter(a => a.estado === 'EN_CURSO' && !haTerminado(a))
  const pendientes = aventuras.filter(a => !a.recompensaReclamada && haTerminado(a))
  const historial = aventuras.filter(a => a.recompensaReclamada || a.estado === 'FALLIDA')

  if (loading) return <div className="spinner" />

  return (
    <div className="aventuras-page">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <div>
          <h1>🗺️ Aventuras</h1>
          <p style={{color:'var(--text-secondary)',fontSize:13,marginTop:4}}>
            {activas.length} / {gremio?.maxAventuras} activas · {pendientes.length} listas para reclamar
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}
          disabled={activas.length >= (gremio?.maxAventuras || 1)}>
          ＋ Nueva Aventura
        </button>
      </div>

      {pendientes.length > 0 && (
        <div style={{marginBottom:'1.5rem'}}>
          <h2 style={{fontSize:'1rem',marginBottom:'0.8rem',color:'var(--success)'}}>🎁 Listas para reclamar</h2>
          <div className="grid-3">
            {pendientes.map(av => <AventuraCard key={av.id} av={av} done onReclamar={handleReclamar} />)}
          </div>
        </div>
      )}

      {activas.length > 0 && (
        <div style={{marginBottom:'1.5rem'}}>
          <h2 style={{fontSize:'1rem',marginBottom:'0.8rem'}}>⚔️ En curso</h2>
          <div className="grid-3">
            {activas.map(av => <AventuraCard key={av.id} av={av} done={false} onReclamar={handleReclamar} />)}
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div>
          <h2 style={{fontSize:'1rem',marginBottom:'0.8rem',color:'var(--text-secondary)'}}>📜 Historial</h2>
          <div className="aventuras-historial">
            {historial.slice(0,20).map(av => (
              <div key={av.id} className="card historial-row">
                <span className="diff-badge">Dif. {av.dificultad}</span>
                <span style={{flex:1,fontSize:13,color:'var(--text-secondary)',marginLeft:8}}>
                  {av.equipo?.length || 0} aventureros
                </span>
                <span style={{color:'var(--accent-gold)',fontSize:13}}>+{av.oroRecompensa}🪙</span>
                <span style={{fontSize:12,color:'var(--text-muted)',marginLeft:8}}>
                  {new Date(av.fechaInicio).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aventuras.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
          <div style={{fontSize:48,marginBottom:'1rem'}}>🗺️</div>
          <p>No hay aventuras todavía. ¡Envía a tu equipo!</p>
        </div>
      )}

      {showModal && (
        <NuevaAventuraModal
          aventureros={aventureros} gremio={gremio}
          onClose={() => setShowModal(false)} onCrear={fetchData} />
      )}
    </div>
  )
}

function AventuraCard({ av, done, onReclamar }) {
  const total = av.fechaFin && av.fechaInicio
    ? Math.max(1, Math.floor((new Date(av.fechaFin) - new Date(av.fechaInicio)) / 1000))
    : 120
  const restante = (av.estado === 'EN_CURSO' && !done)
    ? Math.max(0, Math.floor(av.segundosRestantes ?? 0))
    : 0
  const pct = done ? 100
    : Math.min(100, Math.round(((total - restante) / total) * 100))

  return (
    <div className="card aventura-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span className="diff-badge">Dif. {av.dificultad}</span>
        <span style={{fontSize:12,color:'var(--text-muted)'}}>{av.equipo?.length || 0} héroes</span>
      </div>
      <div style={{background:'var(--bg-primary)',borderRadius:20,height:8,overflow:'hidden',marginBottom:8}}>
        <div style={{
          width:`${pct}%`, height:'100%',
          background:'linear-gradient(90deg,#ffd700,#ff9800)',
          borderRadius:20, transition:'width 1s linear'
        }}/>
      </div>
      {av.estado === 'EN_CURSO' && !done && (
        <div style={{fontSize:12,color:'var(--text-muted)',textAlign:'center',marginBottom:8}}>
          ⏱️ <CountDown segundos={av.segundosRestantes} />
        </div>
      )}
      <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:8}}>
        Recompensa: <span style={{color:'var(--accent-gold)',fontWeight:700}}>{av.oroRecompensa}🪙</span>
        {' · '}<span style={{color:'var(--success)'}}>{av.expRecompensa} XP</span>
      </div>
      {done && !av.recompensaReclamada && (
        <button className="btn-primary"
          style={{width:'100%',fontSize:13,padding:'0.5rem'}}
          onClick={() => onReclamar(av.id)}>
          🎁 Reclamar Recompensa
        </button>
      )}
    </div>
  )
}
