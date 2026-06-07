import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGremio } from '../../services/gremioService'
import { getAventuras } from '../../services/aventuraService'
import { useGremioStore } from '../../store/gremioStore'
import './DashboardPage.css'

function AventuraCard({ av, onReclamar }) {
  const calcRestante = () => {
    if (!av.fechaFin) return 0
    const diff = Math.floor((new Date(av.fechaFin) - Date.now()) / 1000)
    return diff > 0 ? diff : 0
  }

  const [remaining, setRemaining] = useState(calcRestante)

  useEffect(() => {
    if (av.estado !== 'EN_CURSO') return
    const interval = setInterval(() => {
      setRemaining(calcRestante())
    }, 1000)
    return () => clearInterval(interval)
  }, [av.fechaFin, av.estado])

  const total = av.fechaFin && av.fechaInicio
    ? Math.max(1, Math.floor((new Date(av.fechaFin) - new Date(av.fechaInicio)) / 1000))
    : 120
  const pct = av.estado === 'COMPLETADA' ? 100
    : Math.min(100, Math.round(((total - remaining) / total) * 100))

  const formatTiempo = (seg) => {
    if (seg <= 0) return 'Finalizando...'
    const h = Math.floor(seg / 3600)
    const m = Math.floor((seg % 3600) / 60)
    const s = seg % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${String(s).padStart(2, '0')}s`
  }

  return (
    <div className="av-adventure-card card">
      <div className="av-adventure-card__header">
        <span className="diff-badge">Dif. {av.dificultad}</span>
        <span className={`status-badge status-${av.estado}`}>{av.estado}</span>
      </div>
      <div className="av-adventure-card__team">
        {av.equipo?.map(h => <span key={h.id} title={h.nombre}>⚔️</span>)}
        <span style={{fontSize:12,color:'var(--text-muted)',marginLeft:4}}>
          {av.equipo?.length || 0}/5
        </span>
      </div>
      <div style={{
        background:'var(--bg-primary)', borderRadius:20,
        height:6, overflow:'hidden', margin:'0.5rem 0'
      }}>
        <div style={{
          width:`${pct}%`, height:'100%',
          background:'linear-gradient(90deg,#ffd700,#ff9800)',
          borderRadius:20, transition:'width 1s linear'
        }}/>
      </div>
      {av.estado === 'EN_CURSO' && (
        <div style={{fontSize:12,color:'var(--text-muted)',textAlign:'center'}}>
          ⏱️ {formatTiempo(remaining)}
        </div>
      )}
      {av.estado === 'COMPLETADA' && !av.recompensaReclamada && (
        <button
          className="btn-primary"
          style={{width:'100%',marginTop:'0.5rem',fontSize:12,padding:'0.4rem'}}
          onClick={() => onReclamar(av.id)}>
          🎁 Reclamar ({av.oroRecompensa}🪙)
        </button>
      )}
      {av.recompensaReclamada && (
        <div style={{textAlign:'center',fontSize:12,color:'var(--success)'}}>
          ✅ Reclamada
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [aventuras, setAventuras] = useState([])
  const { gremio, setGremio } = useGremioStore()

  const fetchData = async () => {
    try {
      const [gRes, aRes] = await Promise.all([getGremio(), getAventuras()])
      setGremio(gRes.data)
      setAventuras(aRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleReclamar = async (id) => {
    const { reclamarRecompensa } = await import('../../services/aventuraService')
    await reclamarRecompensa(id)
    fetchData()
  }

  if (loading) return <div className="spinner" />

  const activas = aventuras.filter(a => a.estado === 'EN_CURSO' || (a.estado === 'COMPLETADA' && !a.recompensaReclamada))

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>🏰 {gremio?.nombre}</h1>
          <p style={{color:'var(--text-secondary)',marginTop:4}}>Nivel {gremio?.nivelGremio} · Dificultad máx. {gremio?.dificultadMax}</p>
        </div>
        <div className="dashboard__oro">
          <span style={{fontSize:28}}>🪙</span>
          <div>
            <div style={{fontSize:24,fontWeight:700,color:'var(--accent-gold)'}}>{gremio?.oro?.toLocaleString()}</div>
            <div style={{fontSize:12,color:'var(--text-muted)'}}>oro disponible</div>
          </div>
        </div>
      </div>

      <div className="dashboard__stats grid-4">
        {[
          { icon:'⚔️', label:'Aventureros', value:`${gremio?.totalAventureros}/50`, to:'/aventureros' },
          { icon:'🗺️', label:'Aventuras activas', value:`${gremio?.aventurasActivas}/${gremio?.maxAventuras}`, to:'/aventuras' },
          { icon:'🎰', label:'Reclutamiento', value:'Tirar ahora', to:'/gacha' },
          { icon:'⬆️', label:'Mejoras', value:'Mejorar gremio', to:'/mejoras' },
        ].map(s => (
          <Link key={s.label} to={s.to} className="stat-card card" style={{textDecoration:'none'}}>
            <span style={{fontSize:32}}>{s.icon}</span>
            <div>
              <div style={{fontWeight:700,fontSize:18,color:'var(--accent-gold)'}}>{s.value}</div>
              <div style={{fontSize:12,color:'var(--text-secondary)'}}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{fontSize:'1.2rem'}}>Aventuras Activas</h2>
          <Link to="/aventuras" className="btn-secondary" style={{fontSize:13,padding:'0.4rem 0.8rem',borderRadius:8,textDecoration:'none'}}>
            + Nueva aventura
          </Link>
        </div>
        {activas.length === 0
          ? <p style={{color:'var(--text-muted)',textAlign:'center',padding:'2rem'}}>No hay aventuras activas. ¡Envía a tu equipo!</p>
          : <div className="grid-3">
              {activas.map(av => <AventuraCard key={av.id} av={av} onReclamar={handleReclamar} />)}
            </div>
        }
      </div>
    </div>
  )
}
