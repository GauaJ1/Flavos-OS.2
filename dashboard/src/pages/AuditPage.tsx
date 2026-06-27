// AuditPage — audit trail with Segmented filter bar + premium table
import { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Select, Segmented, Space, Button, Typography, Tooltip, Badge, Tag,
} from 'antd'
import { ReloadOutlined, SafetyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { fetchAudit } from '../api/client'
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState'
import { AuthError } from '../types'
import type { AuditEvent } from '../types'
import { formatTimestamp, truncate } from '../utils/format'
import { maskSensitiveStrings } from '../utils/security'

const { Text } = Typography

interface AuditPageProps {
  onUnauthorized: () => void
  refreshKey: number
}

const LINE_OPTIONS = [
  { value: 20,  label: '20 events' },
  { value: 50,  label: '50 events' },
  { value: 100, label: '100 events' },
  { value: 200, label: '200 events' },
]

type Filter = 'all' | 'success' | 'failed'

function MaskedId({ value }: { value: string }) {
  if (!value || value === '—') return <Text type="secondary">—</Text>
  const safe = maskSensitiveStrings(value)
  const isLong = safe.length > 16
  const display = isLong ? `${safe.slice(0, 8)}…${safe.slice(-4)}` : safe
  return (
    <Tooltip title={safe} placement="topLeft">
      <Text code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'default' }}>
        {display}
      </Text>
    </Tooltip>
  )
}

const METHOD_COLORS: Record<string, string> = {
  GET:    '#3dff9f',
  POST:   '#36d6ff',
  PUT:    '#ffd166',
  DELETE: '#ff5f7e',
  PATCH:  '#a78bfa',
}

const METHOD_BG: Record<string, string> = {
  GET:    'rgba(61,255,159,0.08)',
  POST:   'rgba(54,214,255,0.08)',
  PUT:    'rgba(255,209,102,0.08)',
  DELETE: 'rgba(255,95,126,0.08)',
  PATCH:  'rgba(167,139,250,0.08)',
}

const columns: ColumnsType<AuditEvent> = [
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 155,
    render: (v: string) => (
      <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        {formatTimestamp(v)}
      </Text>
    ),
  },
  {
    title: 'Method',
    dataIndex: 'method',
    key: 'method',
    width: 80,
    render: (v: string) => {
      const upper = (v ?? '').toUpperCase()
      return (
        <Tag
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            background: METHOD_BG[upper] ?? 'rgba(255,255,255,0.04)',
            color: METHOD_COLORS[upper] ?? 'var(--text-muted)',
            border: `1px solid ${(METHOD_COLORS[upper] ?? '#fff') + '33'}`,
            letterSpacing: '0.04em',
          }}
        >
          {upper}
        </Tag>
      )
    },
  },
  {
    title: 'Path',
    dataIndex: 'path',
    key: 'path',
    ellipsis: { showTitle: false },
    render: (v: string) => {
      const safe = maskSensitiveStrings(v ?? '—')
      return (
        <Tooltip title={safe} placement="topLeft">
          <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-soft)' }}>
            {truncate(safe, 40)}
          </Text>
        </Tooltip>
      )
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    ellipsis: true,
    render: (v: string) => (
      <Text style={{ fontSize: 12 }}>{maskSensitiveStrings(v ?? '—')}</Text>
    ),
  },
  {
    title: 'Result',
    dataIndex: 'result',
    key: 'result',
    width: 95,
    render: (v: string) => {
      const ok = v === 'success'
      return (
        <Badge
          status={ok ? 'success' : 'error'}
          text={
            <Text style={{ fontSize: 11, fontWeight: 600, color: ok ? 'var(--success)' : 'var(--danger)' }}>
              {(v ?? '—').toUpperCase()}
            </Text>
          }
        />
      )
    },
  },
  {
    title: 'Status',
    dataIndex: 'status_code',
    key: 'status_code',
    width: 70,
    render: (v: number | undefined) => {
      if (v == null) return <Text type="secondary">—</Text>
      const color = v < 300 ? 'var(--success)' : v < 500 ? 'var(--warning)' : 'var(--danger)'
      return (
        <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, fontWeight: 700 }}>
          {v}
        </Text>
      )
    },
  },
  {
    title: 'Reason',
    dataIndex: 'reason',
    key: 'reason',
    ellipsis: { showTitle: false },
    render: (v: string) => {
      const safe = maskSensitiveStrings(v ?? '—')
      return (
        <Tooltip title={safe} placement="topLeft">
          <Text type="secondary" style={{ fontSize: 11 }}>
            {truncate(safe, 32)}
          </Text>
        </Tooltip>
      )
    },
  },
  {
    title: 'Request ID',
    dataIndex: 'request_id',
    key: 'request_id',
    width: 130,
    render: (v: string) => <MaskedId value={v ?? '—'} />,
  },
]

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
  if (error)   return <ErrorState message={error} onRetry={load} />

  const successCount = events.filter(e => e.result === 'success').length
  const failedCount  = events.filter(e => e.result !== 'success').length

  const segmentOptions = [
    {
      label: (
        <Space size={6}>
          <span>All</span>
          <Tag style={{ margin: 0, fontSize: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {events.length}
          </Tag>
        </Space>
      ),
      value: 'all',
    },
    {
      label: (
        <Space size={6}>
          <span>Success</span>
          <Tag style={{ margin: 0, fontSize: 10, background: 'rgba(61,255,159,0.08)', border: '1px solid rgba(61,255,159,0.2)', color: 'var(--success)' }}>
            {successCount}
          </Tag>
        </Space>
      ),
      value: 'success',
    },
    {
      label: (
        <Space size={6}>
          <span>Failed</span>
          <Tag style={{ margin: 0, fontSize: 10, background: 'rgba(255,95,126,0.08)', border: '1px solid rgba(255,95,126,0.2)', color: 'var(--danger)' }}>
            {failedCount}
          </Tag>
        </Space>
      ),
      value: 'failed',
    },
  ]

  return (
    <div className="page-content">
      {/* Page header */}
      <div className="page-header">
        <div className="page-title-group">
          <SafetyOutlined className="page-title-icon" />
          <h2 className="page-title">Audit Log</h2>
        </div>
        <Button
          id="audit-refresh"
          icon={<ReloadOutlined />}
          onClick={load}
          loading={loading}
          type="text"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* Filter bar */}
      <Card bordered={false} styles={{ body: { padding: '12px 20px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Segmented
            options={segmentOptions}
            value={filter}
            onChange={v => setFilter(v as Filter)}
          />
          <Space size={10}>
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Show
            </Text>
            <Select
              id="audit-lines"
              value={lines}
              onChange={v => setLines(v)}
              options={LINE_OPTIONS}
              size="small"
              style={{ width: 120 }}
            />
          </Space>
        </div>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState message="No audit events match the selected filter." />
      ) : (
        <Card bordered={false} styles={{ body: { padding: 0 } }}>
          <Table<AuditEvent>
            columns={columns}
            dataSource={filtered}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={{ pageSize: 25, size: 'small', showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            rowClassName={record =>
              record.result === 'success' ? 'audit-row-success' : 'audit-row-failed'
            }
          />
        </Card>
      )}
    </div>
  )
}
