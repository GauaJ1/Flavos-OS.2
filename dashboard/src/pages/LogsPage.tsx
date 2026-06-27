import { useState, useEffect, useCallback } from 'react'
import { fetchLogsList, fetchLogs } from '../api/client'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { AuthError, ApiError } from '../types'
import { maskSensitiveStrings } from '../utils/security'
import { Card, Select, Button, Space, Alert, Typography, Tag } from 'antd'
import { ReloadOutlined, FileTextOutlined, ConsoleSqlOutlined } from '@ant-design/icons'

const { Text } = Typography

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
    <div className="page-content">
      {/* Page header */}
      <div className="page-header">
        <div className="page-title-group">
          <FileTextOutlined className="page-title-icon" />
          <h2 className="page-title">Logs</h2>
        </div>
        <Button
          id="logs-refresh"
          type="text"
          icon={<ReloadOutlined />}
          onClick={loadLogs}
          loading={loadingLogs}
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* Controls card */}
      <Card
        bordered={false}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Space align="center" size={10}>
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Service
            </Text>
            <Select
              id="logs-service-select"
              value={selectedService}
              onChange={val => setSelectedService(val)}
              style={{ minWidth: 180 }}
              options={serviceList.map(s => ({ value: s, label: s }))}
            />
          </Space>

          <Space align="center" size={10}>
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Lines
            </Text>
            <Select
              id="logs-lines-select"
              value={lines}
              onChange={val => setLines(val)}
              style={{ minWidth: 100 }}
              options={LINE_OPTIONS.map(n => ({ value: n, label: String(n) }))}
            />
          </Space>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ borderRadius: 10 }}
        />
      )}

      {/* Terminal */}
      {loadingLogs ? (
        <LoadingState message={`Loading logs for ${selectedService}…`} />
      ) : logLines.length === 0 ? (
        <EmptyState message="No log lines to display." />
      ) : (
        <Card
          bordered={false}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ConsoleSqlOutlined style={{ color: 'var(--accent-primary)', fontSize: 13 }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {selectedService}
              </span>
              <Tag
                style={{
                  background: 'var(--accent-glow-soft)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                }}
              >
                {logLines.length} lines
              </Tag>
            </div>
          }
        >
          <pre
            className="log-terminal"
            aria-label={`Logs for ${selectedService}`}
          >
            {logLines.join('\n')}
          </pre>
        </Card>
      )}
    </div>
  )
}
