import { useState, useEffect } from 'react'
import { tirarX1, tirarX10, getHistorial } from '../../services/gachaService'
import { getGremio } from '../../services/gremioService'
import { useGremioStore } from '../../store/gremioStore'
import RarityBadge from '../../components/common/RarityBadge'
import RolIcon from '../../components/common/RolIcon'
import './GachaPage.css'

const RARITY_COLORS = {
  COMUN:'#9e9e9e', RARO:'#42a5f5',
  SUPER_RARO:'#ab47bc', SUPER_ULTRA_RARO:'#ffa726', SECRETO:'#ef5350'
}

function ResultCard({ av, esEvolucion }) {
  return (
    <div className={`gacha-result-card gacha-result-card--${av.rareza}`}>
      {esEvolucion && <div className="evolution-badge">⭐ EVOLUCIÓN</div>}
      <div className="gacha-result-card__icon">
        <RolIcon rol={av.rol} size={48} />
      </div>
      <div className="gacha-result-card__name">{av.nombre}</div>
      <RarityBadge rareza={av.rareza} />
      <div style={{marginTop:6,fontSize:12,color:'var(--text-secondary)'}}>
        {av.rol} · Nv {av.nivel}
      </div>
      <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>
        ❤️ {av.vidaTotal} ⚔️ {av.ataqueTotal} 🛡️ {av.defensaTotal}
      </div>
    </div>
  )
}

export default function GachaPage() {
  const [oro, setOro] = useState(null)
  const [resultados, setResultados] = useState([])
  const [evoluciones, setEvoluciones] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [animating, setAnimating] = useState(false)
  const { setGremio } = useGremioStore()

  const fetchData = async () => {
    const [gRes, hRes] = await Promise.all([getGremio(), getHistorial()])
    setOro(gRes.data.oro)
    setGremio(gRes.data)
    setHistorial(hRes.data.slice(0, 20))
  }

  useEffect(() => { fetchData() }, [])

  const handleTirar = async (multiple) => {
    setLoading(true); setError(''); setResultados([]); setEvoluciones([])
    try {
      const fn = multiple ? tirarX10 : tirarX1
      const { data } = await fn()
      setAnimating(true)
      setTimeout(() => {
        setResultados(data.aventureros)
        setEvoluciones(data.fueEvolucion)
        setOro(data.oroRestante)
        setAnimating(false)
        fetchData()
      }, 800)
    } catch (e) {
      setError(e.response?.data?.error || 'Error en la tirada')
    } finally { setLoading(false) }
  }

  const PROB_ROWS = [
    { rareza:'SECRETO', prob:'0.0001%', req:'Dif. 10+', mult:'x10' },
    { rareza:'SUPER_ULTRA_RARO', prob:'1%', req:'Dif. 5+', mult:'x4' },
    { rareza:'SUPER_RARO', prob:'10%', req:'Dif. 2+', mult:'x2' },
    { rareza:'RARO', prob:'40%', req:'Inicio', mult:'x1.5' },
    { rareza:'COMUN', prob:'80%', req:'Inicio', mult:'x1.1' },
  ]

  return (
    <div className="gacha-page">
      <h1>🎰 Portal de Reclutamiento</h1>

      <div className="gacha-portal card">
        <div className={`portal-crystal ${animating ? 'portal-crystal--spin' : ''}`}>🔮</div>
        <div className="portal-oro">
          <span>🪙 {oro?.toLocaleString()} oro disponible</span>
        </div>
        <div className="portal-buttons">
          <button className="btn-gacha btn-gacha--x1 btn-primary"
            onClick={() => handleTirar(false)} disabled={loading || (oro !== null && oro < 100)}>
            {loading ? '...' : '✨ Tirada x1'}
            <span className="gacha-cost">100 🪙</span>
          </button>
          <button className="btn-gacha btn-gacha--x10 btn-secondary"
            onClick={() => handleTirar(true)} disabled={loading || (oro !== null && oro < 900)}>
            {loading ? '...' : '💎 Tirada x10'}
            <span className="gacha-cost">900 🪙</span>
          </button>
        </div>
        {error && <div className="error-msg" style={{marginTop:'0.5rem',textAlign:'center'}}>{error}</div>}
      </div>

      {resultados.length > 0 && (
        <div className="gacha-results">
          <h2 style={{textAlign:'center',marginBottom:'1rem'}}>
            {resultados.length === 1 ? '¡Nuevo recluta!' : `¡${resultados.length} nuevos reclutas!`}
          </h2>
          <div className={resultados.length === 1 ? 'gacha-results-single' : 'gacha-results-grid'}>
            {resultados.map((av, i) => <ResultCard key={i} av={av} esEvolucion={evoluciones[i]} />)}
          </div>
        </div>
      )}

      <div className="gacha-info-grid grid-2" style={{marginTop:'2rem'}}>
        <div className="card">
          <h3 style={{fontSize:'1rem',marginBottom:'0.8rem'}}>📊 Probabilidades</h3>
          <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
            <thead>
              <tr style={{color:'var(--text-muted)'}}>
                <th style={{textAlign:'left',padding:'4px 0'}}>Rareza</th>
                <th>Prob.</th><th>Requisito</th><th>Stats</th>
              </tr>
            </thead>
            <tbody>
              {PROB_ROWS.map(r => (
                <tr key={r.rareza} style={{borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                  <td style={{padding:'6px 0'}}><RarityBadge rareza={r.rareza}/></td>
                  <td style={{textAlign:'center',fontWeight:700,color:RARITY_COLORS[r.rareza]}}>{r.prob}</td>
                  <td style={{textAlign:'center',color:'var(--text-muted)'}}>{r.req}</td>
                  <td style={{textAlign:'center',color:'var(--accent-gold)'}}>{r.mult}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{fontSize:'1rem',marginBottom:'0.8rem'}}>📜 Últimas tiradas</h3>
          {historial.length === 0
            ? <p style={{color:'var(--text-muted)',fontSize:13}}>Sin historial todavía.</p>
            : <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {historial.map((t, i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <RarityBadge rareza={t.rarezaObtenida}/>
                    <span style={{color:'var(--text-muted)'}}>{t.costeOro} 🪙</span>
                    <span style={{color:'var(--text-muted)'}}>{new Date(t.fechaTirada).toLocaleDateString('es-ES')}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
