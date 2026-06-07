import { useEffect, useState } from 'react'
import { getAventureros } from '../../services/aventureroService'
import { getInventario } from '../../services/inventarioService'
import { equiparItem } from '../../services/aventureroService'
import AventureroCard from '../../components/common/AventureroCard'
import RarityBadge from '../../components/common/RarityBadge'
import RolIcon from '../../components/common/RolIcon'
import StatBar from '../../components/common/StatBar'
import './AventurerosPage.css'

const ROLES = ['TODOS','GUERRERO','TANQUE','MAGO','ASESINO','SOPORTE']
const RAREZAS = ['TODOS','COMUN','RARO','SUPER_RARO','SUPER_ULTRA_RARO','SECRETO']
const ROL_LABELS = { GUERRERO:'Guerrero', TANQUE:'Tanque', MAGO:'Mago', ASESINO:'Asesino', SOPORTE:'Soporte' }
const HAB_DESCRIPCIONES = {
  GUERRERO: 'Modo Berserk: triplica daño + sangrado al bajar del 50% de vida.',
  TANQUE:   'Reducción de daño 30% al bajar del 70% de vida.',
  MAGO:     'Gran Bola de Fuego: 400% daño mágico en área.',
  ASESINO:  'Esquiva todos los ataques durante 5 s al iniciar combate.',
  SOPORTE:  'Revive un aliado al 100% + buff +25% a stats del equipo.',
}

function AventureroModal({ av, inventario, onClose, onEquip }) {
  const [equipping, setEquipping] = useState(false)
  const [msg, setMsg] = useState('')

  const armas = inventario.filter(i => i.tipo === 'ARMA' && !i.equipado)
  const armaduras = inventario.filter(i => i.tipo === 'ARMADURA' && !i.equipado)

  const handleEquip = async (armaId, armaduraId) => {
    setEquipping(true); setMsg('')
    try {
      await equiparItem(av.id, armaId, armaduraId)
      setMsg('✅ Equipado correctamente')
      onEquip()
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.error || 'Error al equipar'))
    } finally { setEquipping(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <RolIcon rol={av.rol} size={40} />
          <div>
            <h2 style={{fontSize:'1.3rem'}}>{av.nombre}</h2>
            <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
              <RarityBadge rareza={av.rareza} />
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>{ROL_LABELS[av.rol]} · Nv {av.nivel}</span>
              {av.evolucionado && <span style={{color:'var(--accent-gold)',fontSize:12}}>⭐ Evolucionado</span>}
            </div>
          </div>
        </div>
        <div className="modal-stats">
          <StatBar label="Vida"     value={av.vidaTotal}    max={2000} color="#e74c3c" />
          <StatBar label="Ataque"   value={av.ataqueTotal}  max={600}  color="#e67e22" />
          <StatBar label="Defensa"  value={av.defensaTotal} max={400}  color="#3498db" />
          <StatBar label="Velocidad" value={av.velocidadBase} max={200} color="#9b59b6" />
          <StatBar label="Suerte"   value={av.suerteBase}   max={200}  color="#2ecc71" />
          <StatBar label="Crítico"  value={Math.round(av.criticoBase*100)} max={100} color="#f1c40f" />
        </div>
        <div className="modal-xp">
          <span style={{fontSize:12,color:'var(--text-secondary)'}}>XP: {av.experiencia} / {av.expSiguienteNivel}</span>
          <div className="xp-bar" style={{marginTop:4}}><div className="xp-bar-fill" style={{width:`${Math.min(100,(av.experiencia/av.expSiguienteNivel)*100)}%`}}/></div>
        </div>
        {av.habilidadOculta && (
          <div className="hab-oculta-box">
            <div style={{fontWeight:700,color:'var(--accent-gold)',marginBottom:4}}>⚡ Habilidad Oculta Activa</div>
            <p style={{fontSize:13,color:'var(--text-secondary)'}}>{HAB_DESCRIPCIONES[av.rol]}</p>
          </div>
        )}
        <div className="equip-section">
          <h3 style={{fontSize:'1rem',marginBottom:'0.8rem'}}>Equipamiento</h3>
          <div className="equip-slots">
            <div className="equip-slot">
              <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>⚔️ Arma actual</div>
              {av.arma
                ? <div style={{background:'var(--bg-primary)',padding:'0.4rem 0.6rem',borderRadius:6,fontSize:13}}>
                    {av.arma.nombre} <RarityBadge rareza={av.arma.rareza}/>
                    <button style={{fontSize:11,padding:'2px 6px',marginLeft:8,background:'rgba(231,76,60,0.2)',color:'#ff6b6b',border:'none',borderRadius:4}} onClick={() => handleEquip(-1, undefined)}>Quitar</button>
                  </div>
                : <div style={{color:'var(--text-muted)',fontSize:13}}>Sin arma</div>}
              <select onChange={e => e.target.value && handleEquip(Number(e.target.value), undefined)} defaultValue="" style={{marginTop:6,fontSize:12}}>
                <option value="">Equipar arma...</option>
                {armas.map(a => <option key={a.id} value={a.id}>{a.nombre} (+{a.bonusAtaque} atk)</option>)}
              </select>
            </div>
            <div className="equip-slot">
              <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>🛡️ Armadura actual</div>
              {av.armadura
                ? <div style={{background:'var(--bg-primary)',padding:'0.4rem 0.6rem',borderRadius:6,fontSize:13}}>
                    {av.armadura.nombre} <RarityBadge rareza={av.armadura.rareza}/>
                    <button style={{fontSize:11,padding:'2px 6px',marginLeft:8,background:'rgba(231,76,60,0.2)',color:'#ff6b6b',border:'none',borderRadius:4}} onClick={() => handleEquip(undefined, -1)}>Quitar</button>
                  </div>
                : <div style={{color:'var(--text-muted)',fontSize:13}}>Sin armadura</div>}
              <select onChange={e => e.target.value && handleEquip(undefined, Number(e.target.value))} defaultValue="" style={{marginTop:6,fontSize:12}}>
                <option value="">Equipar armadura...</option>
                {armaduras.map(a => <option key={a.id} value={a.id}>{a.nombre} (+{a.bonusDefensa} def)</option>)}
              </select>
            </div>
          </div>
          {msg && <div className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'} style={{marginTop:8}}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}

export default function AventurerosPage() {
  const [aventureros, setAventureros] = useState([])
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filtroRol, setFiltroRol] = useState('TODOS')
  const [filtroRareza, setFiltroRareza] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')

  const fetchData = async () => {
    try {
      const [avRes, invRes] = await Promise.all([getAventureros(), getInventario()])
      setAventureros(avRes.data)
      setInventario(invRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtrados = aventureros.filter(av => {
    if (filtroRol !== 'TODOS' && av.rol !== filtroRol) return false
    if (filtroRareza !== 'TODOS' && av.rareza !== filtroRareza) return false
    if (busqueda && !av.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  if (loading) return <div className="spinner" />

  const selectedAv = aventureros.find(a => a.id === selected)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1>⚔️ Mis Aventureros</h1>
        <span style={{color:'var(--text-secondary)',fontSize:14}}>{aventureros.length} / 50</span>
      </div>

      <div className="av-filters card" style={{marginBottom:'1.5rem',display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'center'}}>
        <input placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{width:180}} />
        <div className="filter-group">
          {ROLES.map(r => (
            <button key={r} onClick={() => setFiltroRol(r)}
              className={filtroRol === r ? 'btn-primary' : 'btn-secondary'}
              style={{padding:'0.3rem 0.7rem',fontSize:12,borderRadius:20}}>
              {r === 'TODOS' ? 'Todos' : ROL_LABELS[r]}
            </button>
          ))}
        </div>
        <select value={filtroRareza} onChange={e => setFiltroRareza(e.target.value)} style={{width:'auto'}}>
          {RAREZAS.map(r => <option key={r} value={r}>{r === 'TODOS' ? 'Todas las rarezas' : r.replace('_',' ')}</option>)}
        </select>
      </div>

      {filtrados.length === 0
        ? <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
            No hay aventureros. ¡Ve al portal de reclutamiento!
          </div>
        : <div className="grid-4">
            {filtrados.map(av => (
              <AventureroCard key={av.id} av={av} selected={selected === av.id}
                onClick={() => setSelected(selected === av.id ? null : av.id)} />
            ))}
          </div>
      }

      {selectedAv && (
        <AventureroModal
          av={selectedAv}
          inventario={inventario}
          onClose={() => setSelected(null)}
          onEquip={fetchData}
        />
      )}
    </div>
  )
}
