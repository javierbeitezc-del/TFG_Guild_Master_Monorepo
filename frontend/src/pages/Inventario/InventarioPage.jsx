import { useState, useEffect } from 'react'
import { getInventario, venderItem } from '../../services/inventarioService'
import RarityBadge from '../../components/common/RarityBadge'
import './InventarioPage.css'

const TIPO_ICONS = { ARMA: '⚔️', ARMADURA: '🛡️' }

function ItemCard({ item, onVender }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className={`item-card card rarity-border-${item.rareza} ${item.equipado ? 'item-card--equipado' : ''}`}>
      <div className="item-card__header">
        <span className="item-card__icon">{TIPO_ICONS[item.tipo]}</span>
        <div className="item-card__info">
          <span className="item-card__name">{item.nombre}</span>
          <RarityBadge rareza={item.rareza} />
        </div>
        {item.equipado && <span className="equipado-badge">Equipado</span>}
      </div>

      <div className="item-card__stats">
        {item.bonusAtaque > 0  && <span className="stat-chip stat-chip--atk">⚔️ +{item.bonusAtaque}</span>}
        {item.bonusDefensa > 0 && <span className="stat-chip stat-chip--def">🛡️ +{item.bonusDefensa}</span>}
        {item.bonusVida > 0    && <span className="stat-chip stat-chip--hp"> ❤️ +{item.bonusVida}</span>}
      </div>

      <div className="item-card__footer">
        <span style={{fontSize:11,color:'var(--text-muted)'}}>Nivel req. {item.nivelRequerido}</span>
        {!item.equipado && (
          confirming
            ? <div style={{display:'flex',gap:4}}>
                <button className="btn-danger" style={{fontSize:11,padding:'2px 8px'}} onClick={() => { onVender(item.id); setConfirming(false) }}>Confirmar</button>
                <button className="btn-secondary" style={{fontSize:11,padding:'2px 8px'}} onClick={() => setConfirming(false)}>Cancelar</button>
              </div>
            : <button className="btn-secondary" style={{fontSize:11,padding:'2px 6px'}} onClick={() => setConfirming(true)}>Vender</button>
        )}
      </div>
    </div>
  )
}

export default function InventarioPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroRareza, setFiltroRareza] = useState('TODOS')
  const [msg, setMsg] = useState('')

  const fetchItems = async () => {
    try {
      const { data } = await getInventario()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const handleVender = async (id) => {
    try {
      await venderItem(id)
      setMsg('✅ Ítem vendido')
      fetchItems()
      setTimeout(() => setMsg(''), 2000)
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.error || 'Error al vender'))
    }
  }

  const filtrados = items.filter(i => {
    if (filtroTipo !== 'TODOS' && i.tipo !== filtroTipo) return false
    if (filtroRareza !== 'TODOS' && i.rareza !== filtroRareza) return false
    return true
  })

  const armas    = filtrados.filter(i => i.tipo === 'ARMA')
  const armaduras = filtrados.filter(i => i.tipo === 'ARMADURA')

  if (loading) return <div className="spinner" />

  return (
    <div className="inventario-page">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <div>
          <h1>🎒 Inventario</h1>
          <p style={{color:'var(--text-secondary)',fontSize:13,marginTop:4}}>
            {items.length} ítems · {items.filter(i=>i.equipado).length} equipados
          </p>
        </div>
        {msg && <div className={msg.startsWith('✅') ? 'success-msg' : 'error-msg'} style={{margin:0}}>{msg}</div>}
      </div>

      {/* Filtros */}
      <div className="card inv-filters">
        <div className="filter-row">
          <span style={{fontSize:13,color:'var(--text-secondary)',minWidth:50}}>Tipo:</span>
          {['TODOS','ARMA','ARMADURA'].map(t => (
            <button key={t} onClick={() => setFiltroTipo(t)}
              className={filtroTipo === t ? 'btn-primary' : 'btn-secondary'}
              style={{padding:'0.3rem 0.8rem',fontSize:12,borderRadius:20}}>
              {t === 'TODOS' ? 'Todos' : t === 'ARMA' ? '⚔️ Armas' : '🛡️ Armaduras'}
            </button>
          ))}
        </div>
        <div className="filter-row" style={{marginTop:8}}>
          <span style={{fontSize:13,color:'var(--text-secondary)',minWidth:50}}>Rareza:</span>
          {['TODOS','COMUN','RARO','SUPER_RARO','SUPER_ULTRA_RARO','SECRETO'].map(r => (
            <button key={r} onClick={() => setFiltroRareza(r)}
              className={filtroRareza === r ? 'btn-primary' : 'btn-secondary'}
              style={{padding:'0.3rem 0.7rem',fontSize:11,borderRadius:20}}>
              {r === 'TODOS' ? 'Todos' : <RarityBadge rareza={r}/>}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
          <div style={{fontSize:48,marginBottom:'1rem'}}>🎒</div>
          <p>No hay ítems en el inventario. ¡Completa aventuras para obtenerlos!</p>
        </div>
      ) : (
        <>
          {(filtroTipo === 'TODOS' || filtroTipo === 'ARMA') && armas.length > 0 && (
            <section>
              <h2 style={{fontSize:'1rem',margin:'1.2rem 0 0.8rem',color:'var(--text-secondary)'}}>
                ⚔️ Armas ({armas.length})
              </h2>
              <div className="grid-4">
                {armas.map(item => <ItemCard key={item.id} item={item} onVender={handleVender} />)}
              </div>
            </section>
          )}

          {(filtroTipo === 'TODOS' || filtroTipo === 'ARMADURA') && armaduras.length > 0 && (
            <section>
              <h2 style={{fontSize:'1rem',margin:'1.2rem 0 0.8rem',color:'var(--text-secondary)'}}>
                🛡️ Armaduras ({armaduras.length})
              </h2>
              <div className="grid-4">
                {armaduras.map(item => <ItemCard key={item.id} item={item} onVender={handleVender} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
