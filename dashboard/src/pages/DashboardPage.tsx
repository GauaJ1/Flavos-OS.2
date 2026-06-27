// DashboardPage — system overview
import { useState, useEffect, useCallback } from 'react'
import { fetchStatus, fetchMetrics, fetchServices, fetchAudit } from '../api/client'
import { Card } from '../components/Card'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/Badge'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { formatKb, calcPercent, percentColor, formatTimestamp } from '../utils/format'
import type { StatusResponse, MetricsResponse, ServicesResponse, AuditResponse } from '../types'
import { AuthError } from '../types'

interface DashboardPageProps {
  onUnauthorized: () => void
  refreshKey: number
}

export function DashboardPage({ onUnauthorized, refreshKey }: DashboardPageProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [services, setServices] = useState<ServicesResponse | null>(null)
  const [audit, setAudit] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, m, svc, a] = await Promise.all([
        fetchStatus(),
        fetchMetrics(),
        fetchServices(),
        fetchAudit(5),
      ])
      setStatus(s)
      setMetrics(m)
      setServices(svc)
      setAudit(a)
    } catch (err) {
      if (err instanceof AuthError) {
        onUnauthorized()
        return
      }
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [onUnauthorized])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  if (loading) return <LoadingState message="Loading dashboard…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const memUsed = metrics?.memory?.used_kb
  const memTotal = metrics?.memory?.total_kb
  const memPct = calcPercent(memUsed, memTotal)
  const diskPct = Math.round(metrics?.disk?.usage_percent ?? 0)
  const runningCount = services?.services?.filter(s => s.status === 'running').length ?? 0

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
      </div>

      {/* System Info */}
      <Card title="System" className="mb-4">
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">OS</span>
            <span className="info-value">{status?.os ?? '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Base</span>
            <span className="info-value">{status?.base ?? '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Hostname</span>
            <span className="info-value mono">{status?.hostname ?? '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Version</span>
            <span className="info-value">{status?.version ?? '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Uptime</span>
            <span className="info-value mono">{status?.uptime ?? '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Agent</span>
            <StatusBadge status={status?.agent ?? 'unknown'} />
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="stat-grid mb-4">
        <StatCard
          label="CPU Load"
          value={metrics?.cpu?.load_average?.split(' ')[0] ?? '—'}
          sub={metrics?.cpu?.load_average}
        />
        <StatCard
          label="Memory Used"
          value={memPct}
          unit="%"
          variant={percentColor(memPct) as 'success' | 'warning' | 'danger'}
          sub={`${formatKb(memUsed)} / ${formatKb(memTotal)}`}
        />
        <StatCard
          label="Disk Used"
          value={diskPct}
          unit="%"
          variant={percentColor(diskPct) as 'success' | 'warning' | 'danger'}
          sub={`${formatKb(metrics?.disk?.used_kb)} / ${formatKb(metrics?.disk?.total_kb)}`}
        />
        <StatCard
          label="Services Running"
          value={runningCount}
          sub={`of ${services?.services?.length ?? 0} total`}
          variant={runningCount > 0 ? 'success' : 'warning'}
        />
      </div>

      {/* Recent Audit Events */}
      <Card title="Recent Audit Events" className="mb-4">
        {audit?.events && audit.events.length > 0 ? (
          <div className="audit-mini">
            {audit.events.slice(0, 5).map((evt, i) => (
              <div key={i} className={`audit-mini-row audit-mini-${evt.result === 'success' ? 'success' : 'failed'}`}>
                <span className="audit-mini-time">{formatTimestamp(evt.timestamp)}</span>
                <span className="audit-mini-path mono">{evt.path ?? '—'}</span>
                <span className={`audit-mini-result badge badge-${evt.result === 'success' ? 'success' : 'danger'}`}>
                  {evt.result ?? '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No recent audit events.</p>
        )}
      </Card>
    </div>
  )
}
