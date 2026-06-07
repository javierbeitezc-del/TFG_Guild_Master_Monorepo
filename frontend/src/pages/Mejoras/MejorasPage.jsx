import { useState, useEffect } from 'react'
import { getMejoras, mejorar } from '../../services/mejoraService'
import { getGremio } from '../../services/gremioService'
import { useGremioStore } from '../../store/gremioStore'
import './MejorasPage.css'

const MEJORA_INFO = {
  RATIO_DROP:    { icon:'🎁', label:'Ratio de Drop',          desc:'Aumenta la probabilidad de obtener ítems al completar aventuras.' },
  SALUD:         { icon:'❤️', label:'Salud Global',           desc:'Incrementa la vida máxima de todos los aventureros del gremio.' },
  DANIO:         { icon:'⚔️', label:'Daño Global',            desc:'Aumenta el daño de ataque de todos los aventureros.' },
  CRITICO:       { icon:'💥', label:'Probabilidad de Crítico', desc:'Aumenta la probabilidad de golpe crítico de todos los aventureros.' },
  SUERTE:        { icon:'🍀', label:'Suerte',                  desc:'Mejora la rareza de los ítems obtenidos en aventuras.' },
  MAX_AVENTURAS: { icon:'🗺️', label:'Máx. Aventuras',         desc:'Aumenta el número máximo de aventuras simultáneas (máx. 10).' },
}

function MejoraCard({ mejora, oro, onMejorar }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const info = MEJORA_INFO[mejora.tipo] || { icon:'⬆️', label: mejora.tipo, desc:'' }
  const pct = (mejora.nivelActual / 100) * 100
  const puedeMejorar = !mejora.maxNivel && oro >= mejora.costeSiguiente

  const handleClick = async () => {
    setLoading(true); setMsg('')
    try {
      await onMejorar(mejora.tipo)
      setMsg('✅ ¡Mejorado!')
      setTimeout(() => setMsg(''), 2000)
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.error || 'Error al mejorar'))
    } finally { setLoading(false) }
  }

  return (
    <div className={`mejora-card card ${mejora.maxNivel ? 'mejora-card--max' : ''}`}>
      <div className="mejora-card__header">
        <span className="mejora-icon">{info.icon}</span>
        <div className="mejora-card__info">
          <span className="mejora-nombre">{info.label}</span>
          <span className="mejora-nivel">
            {mejora.maxNivel ? '⭐ MÁXIMO' : `Nivel ${mejora.nivelActual} / 100`}
          </span>
        </div>
        <div className="mejora-mult">
          +{((mejora.multiplicador - 1) * 100).toFixed(0)}%
        </div>
      </div>

      <p style={{fontSize:12,color:'var(--text-secondary)',margin:'0.5rem 0'}}>{info.desc}</p>

      <div style={{background:'var(--bg-primary)',borderRadius:20,height:6,overflow:'hidden',marginBottom:'0.8rem'}}>
        <div style={{
          width:`${pct}%`, height:'100%',
          background: mejora.maxNivel
            ? 'linear-gradient(90deg,#ffd700,#ff9800)'
            : 'linear-gradient(90deg,#3498db,#2ecc71)',
          borderRadius:20, transition:'width 0.5s ease'
        }}/>
      </div>

      {mejora.maxNivel ? (
        <div style={{textAlign:'center',color:'var(--accent-gold)',fontSize:13,fontWeight:700}}>
          ⭐ Mejora al máximo nivel
        </div>
      ) : (
        <div className="mejora-card__footer">
          <span style={{fontSize:13,color:'var(--text-secondary)'}}>
            Coste: <strong style={{color: puedeMejorar ? 'var(--accent-gold)' : 'var(--danger)'}}>
              {mejora.costeSiguiente.toLocaleString()} 🪙
            </strong>
          </span>
          <button
            className={puedeMejorar ? 'btn-primary' : 'btn-secondary'}
            style={{fontSize:13,padding:'0.4rem 1rem'}}
            onClick={handleClick}
            disabled={loading || !puedeMejorar}>
            {loading ? '...' : '⬆️ Mejorar'}
          </button>
        </div>
      )}
      {msg && <div className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'} style={{marginTop:6}}>{msg}</div>}
    </div>
  )
}

export default function MejorasPage() {
  const [mejoras, setMejoras] = useState([])
  const [oro, setOro] = useState(0)
  const [loading, setLoading] = useState(true)
  const { setGremio } = useGremioStore()

  const fetchData = async () => {
    try {
      const [mRes, gRes] = await Promise.all([getMejoras(), getGremio()])
      setMejoras(mRes.data)
      setOro(gRes.data.oro)
      setGremio(gRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleMejorar = async (tipo) => {
    await mejorar(tipo)
    await fetchData()
  }

  const totalMejoras = mejoras.reduce((acc, m) => acc + m.nivelActual, 0)
  const maxPosible   = mejoras.length * 100

  if (loading) return <div className="spinner" />

  return (
    <div className="mejoras-page">
      <div className="mejoras-header">
        <div>
          <h1>⬆️ Cuartel General</h1>
          <p style={{color:'var(--text-secondary)',fontSize:13,marginTop:4}}>
            Mejoras totales: {totalMejoras} / {maxPosible}
          </p>
        </div>
        <div className="mejoras-oro card">
          <span style={{fontSize:22}}>🪙</span>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:'var(--accent-gold)'}}>{oro.toLocaleString()}</div>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>oro disponible</div>
          </div>
        </div>
      </div>

      <div style={{background:'var(--bg-secondary)',borderRadius:'var(--border-radius)',height:8,overflow:'hidden',marginBottom:'1.5rem',border:'1px solid rgba(255,215,0,0.1)'}}>
        <div style={{
          width:`${(totalMejoras/maxPosible)*100}%`, height:'100%',
          background:'linear-gradient(90deg,#ffd700,#ff9800)',
          borderRadius:'var(--border-radius)', transition:'width 0.5s ease'
        }}/>
      </div>

      <div className="grid-2">
        {mejoras.map(m => (
          <MejoraCard key={m.id} mejora={m} oro={oro} onMejorar={handleMejorar} />
        ))}
      </div>

      <div className="card mejoras-tip" style={{marginTop:'1.5rem'}}>
        <h3 style={{fontSize:'0.9rem',marginBottom:'0.5rem',color:'var(--accent-gold)'}}>
          💡 Consejo de mejora
        </h3>
        <p style={{fontSize:13,color:'var(--text-secondary)'}}>
          Prioriza <strong>Máx. Aventuras</strong> para poder enviar más equipos a la vez, y
          <strong> Ratio de Drop</strong> para conseguir más ítems. Con el tiempo, sube
          <strong> Salud</strong> y <strong> Daño</strong> para superar dificultades mayores.
        </p>
      </div>
    </div>
  )
}
