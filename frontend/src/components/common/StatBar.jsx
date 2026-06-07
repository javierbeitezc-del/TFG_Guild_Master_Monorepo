export default function StatBar({ label, value, max = 100, color = '#ffd700' }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 20, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}
