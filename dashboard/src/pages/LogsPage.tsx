// LogsPage — read service logs
import { useState, useEffect, useCallback } from 'react'
import { fetchLogsList, fetchLogs } from '../api/client'
import { Card } from '../components/Card'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { AuthError, ApiError } from '../types'
import { maskSensitiveStrings } from '../utils/security'

interface LogsPageProps {
  onUnauthorized: () => void
  refreshKey: number
}

const LINE_OPTIONS = [20, 50, 100, 200]

export function LogsPage({ onUnauthorized, refreshKey }: LogsPageProps) {
  const [serviceList, setServiceList] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [lines, setLines] = useState(50)
  const [logLines, setLogLines] = useState<string[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setLoadingList(true)
    setError(null)
    try {
      const data = await fetchLogsList()
      setServiceList(data.services ?? [])
      if (data.services && data.services.length > 0 && !selectedService) {
        setSelectedService(data.services[0])
      }
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      setError('Failed to load logs list.')
    } finally {
      setLoadingList(false)
    }
  }, [onUnauthorized, selectedService])

  const loadLogs = useCallback(async () => {
    if (!selectedService) return
    setLoadingLogs(true)
    setError(null)
    try {
      const data = await fetchLogs(selectedService, lines)
      const rawLines = data.lines ?? data.logs ?? []
      setLogLines(rawLines.map(maskSensitiveStrings))
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      const code = err instanceof ApiError ? err.code : 'unknown_error'
      if (code === 'log_not_found') {
        setError(`Log file not found for service "${selectedService}".`)
      } else if (code === 'service_not_allowed') {
        setError(`Service "${selectedService}" is not permitted.`)
      } else {
        setError(`Failed to load logs: ${code}`)
      }
      setLogLines([])
    } finally {
      setLoadingLogs(false)
    }
  }, [selectedService, lines, onUnauthorized])

  useEffect(() => { void loadList() }, [loadList, refreshKey])
  useEffect(() => { void loadLogs() }, [loadLogs])

  if (loadingList) return <LoadingState message="Loading log services…" />

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Logs</h2>
        <button id="logs-refresh" className="btn btn-icon" onClick={loadLogs} title="Refresh">↻</button>
      </div>

      <Card className="mb-4">
        <div className="logs-controls">
          <div className="form-group-inline">
            <label htmlFor="logs-service-select" className="form-label">Service</label>
            <select
              id="logs-service-select"
              className="form-select"
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              {serviceList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group-inline">
            <label htmlFor="logs-lines-select" className="form-label">Lines</label>
            <select
              id="logs-lines-select"
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

      {error && <div className="alert alert-danger mb-4" role="alert">{error}</div>}

      {loadingLogs ? (
        <LoadingState message={`Loading logs for ${selectedService}…`} />
      ) : logLines.length === 0 ? (
        <EmptyState message="No log lines to display." />
      ) : (
        <Card title={`${selectedService} — last ${logLines.length} lines`}>
          <pre className="log-output" aria-label={`Logs for ${selectedService}`}>
            {logLines.join('\n')}
          </pre>
        </Card>
      )}
    </div>
  )
}
