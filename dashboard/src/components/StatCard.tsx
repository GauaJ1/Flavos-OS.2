// StatCard — metric card with optional progress bar
interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  variant?: 'success' | 'warning' | 'danger' | 'default'
  sub?: string
  progress?: number // 0–100, shows bar when provided
}

function progressClass(pct: number): string {
  if (pct >= 90) return 'progress-danger'
  if (pct >= 70) return 'progress-warning'
  return 'progress-ok'
}

export function StatCard({ label, value, unit, variant = 'default', sub, progress }: StatCardProps) {
  return (
    <div className={`stat-card${variant !== 'default' ? ` stat-card-${variant}` : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
      {progress !== undefined && (
        <div className="progress-bar">
          <div
            className={`progress-fill ${progressClass(progress)}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  )
}
