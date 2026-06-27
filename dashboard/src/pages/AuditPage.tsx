// AuditPage — view audit trail
import { useState, useEffect, useCallback } from 'react'
import { fetchAudit } from '../api/client'
import { Card } from '../components/Card'
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState'
import { AuthError } from '../types'
import type { AuditEvent } from '../types'
import { formatTimestamp, truncate } from '../utils/format'
import { maskSensitiveStrings } from '../utils/security'

interface AuditPageProps {
  onUnauthorized: () => void
  refreshKey: number
}

const LINE_OPTIONS = [20, 50, 100, 200]
type Filter = 'all' | 'success' | 'failed'

export function AuditPage({ onUnauthorized, refreshKey }: AuditPageProps) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [lines, setLines] = useState(50)
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAudit(lines)
      setEvents(data.events ?? [])
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      setError('Failed to load audit events.')
    } finally {
      setLoading(false)
    }
  }, [lines, onUnauthorized])

  useEffect(() => { void load() }, [load, refreshKey])

  const filtered = events.filter(e =>
    filter === 'all' ? true : e.result === filter
  )

  if (loading) return <LoadingState message="Loading audit events…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const safeText = (s: string | undefined) => maskSensitiveStrings(s ?? '—')

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Audit Log</h2>
        <button id="audit-refresh" className="btn btn-icon" onClick={load} title="Refresh">↻</button>
      </div>

      <Card className="mb-4">
        <div className="logs-controls">
          <div className="form-group-inline">
            <label htmlFor="audit-filter" className="form-label">Filter</label>
            <select
              id="audit-filter"
              className="form-select"
              value={filter}
              onChange={e => setFilter(e.target.value as Filter)}
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="form-group-inline">
            <label htmlFor="audit-lines" className="form-label">Lines</label>
            <select
              id="audit-lines"
              className="form-select"
              value={lines}
              onChange={e => setLines(Number(e.target.value))}
            >
              {LINE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="No audit events match the selected filter." />
      ) : (
        <div className="audit-table-wrapper">
          <table className="audit-table" aria-label="Audit events">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source IP</th>
                <th>Method</th>
                <th>Path</th>
                <th>Action</th>
                <th>Target</th>
                <th>Result</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((evt, i) => (
                <tr key={i} className={`audit-row audit-row-${evt.result === 'success' ? 'success' : 'failed'}`}>
                  <td className="mono text-sm">{formatTimestamp(evt.timestamp)}</td>
                  <td className="mono text-sm">{safeText(evt.source_ip)}</td>
                  <td className="mono text-sm">{safeText(evt.method)}</td>
                  <td className="mono text-sm">{truncate(safeText(evt.path), 40)}</td>
                  <td className="text-sm">{safeText(evt.action)}</td>
                  <td className="mono text-sm">{safeText(evt.target)}</td>
                  <td>
                    <span className={`badge badge-${evt.result === 'success' ? 'success' : 'danger'}`}>
                      {safeText(evt.result)}
                    </span>
                  </td>
                  <td className="text-sm">{evt.status_code ?? '—'}</td>
                  <td className="text-sm text-muted">{truncate(safeText(evt.reason), 30)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
