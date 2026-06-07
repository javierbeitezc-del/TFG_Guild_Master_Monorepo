const ICONS = {
  GUERRERO: '⚔️', TANQUE: '🛡️', MAGO: '🔮', ASESINO: '🗡️', SOPORTE: '💚'
}
const COLORS = {
  GUERRERO: '#ef5350', TANQUE: '#42a5f5', MAGO: '#ab47bc', ASESINO: '#78909c', SOPORTE: '#66bb6a'
}
export default function RolIcon({ rol, size = 24 }) {
  return (
    <span title={rol} style={{ fontSize: size, display: 'inline-block' }}>
      {ICONS[rol] || '❓'}
    </span>
  )
}
export { COLORS as ROL_COLORS }
