import RarityBadge from './RarityBadge'
import RolIcon from './RolIcon'
import './AventureroCard.css'

export default function AventureroCard({ av, onClick, selected }) {
  const xpPct = Math.min(100, (av.experiencia / av.expSiguienteNivel) * 100)
  return (
    <div
      className={`av-card rarity-border-${av.rareza} ${selected ? 'av-card--selected' : ''} ${av.enAventura ? 'av-card--busy' : ''}`}
      onClick={onClick}
    >
      <div className="av-card__header">
        <RolIcon rol={av.rol} size={28} />
        <div className="av-card__info">
          <span className="av-card__name">{av.nombre}</span>
          <RarityBadge rareza={av.rareza} />
        </div>
        <span className="av-card__level">Nv {av.nivel}</span>
      </div>
      <div className="av-card__stats">
        <span title="Vida">❤️ {av.vidaTotal}</span>
        <span title="Ataque">⚔️ {av.ataqueTotal}</span>
        <span title="Defensa">🛡️ {av.defensaTotal}</span>
      </div>
      <div className="xp-bar">
        <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 3, color: 'var(--text-muted)' }}>
        <span>{av.enAventura ? '⚔️ En aventura' : '✅ Disponible'}</span>
        {av.habilidadOculta && <span title="Habilidad oculta desbloqueada">⚡ Habilidad</span>}
      </div>
    </div>
  )
}
