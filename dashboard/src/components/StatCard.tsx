// StatCard component — shows a single metric
interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  variant?: 'success' | 'warning' | 'danger' | 'default'
  sub?: string
}

export function StatCard({ label, value, unit, variant = 'default', sub }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
