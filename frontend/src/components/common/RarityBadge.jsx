const LABELS = {
  COMUN: 'Común', RARO: 'Raro', SUPER_RARO: 'SR',
  SUPER_ULTRA_RARO: 'SUR', SECRETO: '★ Secreto'
}
export default function RarityBadge({ rareza }) {
  return <span className={`badge badge-${rareza}`}>{LABELS[rareza] || rareza}</span>
}
