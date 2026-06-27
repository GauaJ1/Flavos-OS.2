// DashboardPage — system overview with hero card + metric cards
import { useState, useEffect, useCallback } from 'react'
import { fetchStatus, fetchMetrics, fetchServices, fetchAudit } from '../api/client'
import { LoadingState, ErrorState } from '../components/LoadingState'
import { formatKb, calcPercent, percentColor, formatTimestamp } from '../utils/format'
import type { StatusResponse, MetricsResponse, ServicesResponse, AuditResponse } from '../types'
import { AuthError } from '../types'
import { Card, Row, Col, Statistic, Progress, Badge, List, Typography } from 'antd'
import { CloudServerOutlined } from '@ant-design/icons'

const { Text } = Typography

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
        fetchStatus(), fetchMetrics(), fetchServices(), fetchAudit(8),
      ])
      setStatus(s); setMetrics(m); setServices(svc); setAudit(a)
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [onUnauthorized])

  useEffect(() => { void load() }, [load, refreshKey])

  if (loading) return <LoadingState message="Loading dashboard…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const memUsed  = metrics?.memory?.used_kb
  const memTotal = metrics?.memory?.total_kb
  const memPct   = calcPercent(memUsed, memTotal)
  const diskPct  = Math.round(metrics?.disk?.usage_percent ?? 0)
  const runningCount = services?.services?.filter(s => s.status === 'running').length ?? 0
  const totalCount   = services?.services?.length ?? 0

  const loadRaw   = metrics?.cpu?.load_average ?? ''
  const loadParts = loadRaw.split(' ').filter(Boolean)
  const load1  = loadParts[0] ?? '—'
  const load5  = loadParts[1] ?? '—'
  const load15 = loadParts[2] ?? '—'

  const agentStatusInfo = (() => {
    const s = (status?.agent ?? 'unknown').toLowerCase()
    if (s === 'online' || s === 'running') return { status: 'success' as const, text: 'Online' }
    if (s === 'connecting') return { status: 'processing' as const, text: 'Connecting...' }
    if (s === 'error' || s === 'offline' || s === 'failed') return { status: 'error' as const, text: 'Offline' }
    return { status: 'default' as const, text: status?.agent ?? 'Unknown' }
  })()

  const progressColor = (pct: number) => {
    const v = percentColor(pct)
    if (v === 'danger') return 'var(--danger)'
    if (v === 'warning') return 'var(--warning)'
    return 'var(--accent-secondary)'
  }

  const serviceStatusBadge = (s: string) => {
    const l = s.toLowerCase()
    if (l === 'running') return <Badge status="success" text="Running" />
    if (l === 'stopped') return <Badge status="error" text="Stopped" />
    return <Badge status="default" text={s} />
  }

  const MetaItem = ({ label, value }: { label: string; value: string }) => (
    <div>
      <div className="hero-stat-label">{label}</div>
      <div className="hero-stat-value">{value}</div>
    </div>
  )

  return (
    <div className="page-content">

      {/* ── Hero Banner ── */}
      <Card className="hero-card" bordered={false}>
        <div className="hero-accent-bar" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingLeft: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CloudServerOutlined style={{ fontSize: 20, color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                Flavos OS 2.0
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Cloud Edition
              </div>
            </div>
          </div>
          <Badge status={agentStatusInfo.status} text={agentStatusInfo.text} />
        </div>

        <Row gutter={[24, 16]} style={{ paddingLeft: 12 }}>
          <Col xs={12} sm={8} md={4}>
            <MetaItem label="Hostname" value={status?.hostname ?? '—'} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <MetaItem label="OS" value={status?.os ?? '—'} />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <MetaItem label="Base" value={status?.base ?? '—'} />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <MetaItem label="Version" value={status?.version ?? '—'} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <MetaItem label="Uptime" value={status?.uptime ?? '—'} />
          </Col>
        </Row>
      </Card>

      {/* ── Metric Cards ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card
            className="metric-card"
            title="Memory Used"
            bordered={false}
          >
            <Statistic
              value={memPct}
              suffix="%"
              valueStyle={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
              {formatKb(memUsed)} / {formatKb(memTotal)}
            </Text>
            <Progress
              percent={memPct}
              showInfo={false}
              strokeColor={progressColor(memPct)}
              strokeWidth={3}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="metric-card"
            title="Disk Used"
            bordered={false}
          >
            <Statistic
              value={diskPct}
              suffix="%"
              valueStyle={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
              {formatKb(metrics?.disk?.used_kb)} / {formatKb(metrics?.disk?.total_kb)}
            </Text>
            <Progress
              percent={diskPct}
              showInfo={false}
              strokeColor={progressColor(diskPct)}
              strokeWidth={3}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="metric-card"
            title="CPU Load (1m)"
            bordered={false}
          >
            <Statistic
              value={load1}
              valueStyle={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            />
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              5m {load5} · 15m {load15}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="metric-card"
            title="Services Running"
            bordered={false}
          >
            <Statistic
              value={runningCount}
              valueStyle={{
                fontSize: 30,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: runningCount > 0 ? 'var(--success)' : 'var(--warning)',
              }}
            />
            <Text style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              of {totalCount} total
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ── Services + Audit Feeds ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Services" bordered={false} style={{ height: '100%' }}>
            {services?.services && services.services.length > 0 ? (
              <List
                dataSource={services.services.slice(0, 6)}
                renderItem={svc => (
                  <List.Item
                    style={{
                      borderBottom: '1px solid var(--border)',
                      padding: '8px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-soft)' }}
                    >
                      {svc.name}
                    </Text>
                    {serviceStatusBadge(svc.status)}
                  </List.Item>
                )}
                footer={
                  totalCount > 6 ? (
                    <Text style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                      +{totalCount - 6} more services
                    </Text>
                  ) : null
                }
              />
            ) : (
              <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>No services configured.</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Audit Events" bordered={false} style={{ height: '100%' }}>
            {audit?.events && audit.events.length > 0 ? (
              <List
                dataSource={audit.events.slice(0, 8)}
                renderItem={evt => (
                  <List.Item
                    style={{
                      borderBottom: '1px solid var(--border)',
                      padding: '7px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <Text
                        style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', display: 'block' }}
                      >
                        {formatTimestamp(evt.timestamp)}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: 'var(--text-soft)', fontFamily: 'var(--font-mono)' }}
                      >
                        {evt.path ?? '—'}
                      </Text>
                    </div>
                    <Badge
                      status={evt.result === 'success' ? 'success' : 'error'}
                      text={evt.result ?? '—'}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>No recent audit events.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
