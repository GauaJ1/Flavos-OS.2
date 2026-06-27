import { useState, useEffect, useCallback } from 'react'
import { fetchServices, serviceAction } from '../api/client'
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState'
import { AuthError, ApiError } from '../types'
import type { ServiceItem } from '../types'
import { Card, Button, Badge, Popconfirm, Tooltip, Space, App, Row, Col, Typography } from 'antd'
import { ReloadOutlined, PlayCircleOutlined, StopOutlined, SyncOutlined, SettingOutlined } from '@ant-design/icons'

const { Text } = Typography

interface ServicesPageProps {
  onUnauthorized: () => void
  refreshKey: number
}

type ActionType = 'start' | 'stop' | 'restart'

export function ServicesPage({ onUnauthorized, refreshKey }: ServicesPageProps) {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { message: antdMessage } = App.useApp()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchServices()
      setServices(data.services ?? [])
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      setError('Failed to load services.')
    } finally {
      setLoading(false)
    }
  }, [onUnauthorized])

  useEffect(() => { void load() }, [load, refreshKey])

  const handleAction = async (name: string, action: ActionType) => {
    const key = `${name}-${action}`
    setActionLoading(key)
    try {
      await serviceAction(name, action)
      antdMessage.success(`${action.charAt(0).toUpperCase() + action.slice(1)} executed on ${name}.`)
      await load()
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      const code = err instanceof ApiError ? err.code : 'unknown_error'
      antdMessage.error(`Action blocked: ${code}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <LoadingState message="Loading services…" />
  if (error)   return <ErrorState message={error} onRetry={load} />
  if (services.length === 0) return <EmptyState message="No services available." />

  const running = services.filter(s => s.status === 'running').length

  return (
    <div className="page-content">
      {/* Page header */}
      <div className="page-header">
        <div className="page-title-group">
          <SettingOutlined className="page-title-icon" />
          <h2 className="page-title">Services</h2>
          <Badge
            count={`${running} / ${services.length}`}
            style={{
              background: 'var(--success-tint)',
              color: 'var(--success)',
              border: '1px solid rgba(61,255,159,0.2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          />
        </div>
        <Button
          id="services-refresh"
          type="text"
          icon={<ReloadOutlined />}
          onClick={load}
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* Service cards grid */}
      <Row gutter={[16, 16]}>
        {services.map(svc => {
          const actions = svc.allowed_actions ?? []
          const isRunning = svc.status === 'running'

          return (
            <Col key={svc.name} xs={24} lg={12}>
              <Card
                className={`service-card ${isRunning ? 'service-card-running' : 'service-card-stopped'}`}
                bordered={false}
              >
                {/* Service name + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: svc.raw ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Text
                      strong
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-soft)' }}
                    >
                      {svc.name}
                    </Text>
                    {isRunning
                      ? <Badge status="success" text="Running" />
                      : <Badge status="error" text="Stopped" />
                    }
                  </div>

                  <Space size={8}>
                    {/* Start */}
                    {actions.includes('start') && (
                      <Popconfirm
                        title={`Start ${svc.name}?`}
                        onConfirm={() => void handleAction(svc.name, 'start')}
                        okText="Start"
                        cancelText="Cancel"
                      >
                        <Button
                          id={`svc-${svc.name}-start`}
                          size="small"
                          icon={<PlayCircleOutlined />}
                          loading={actionLoading === `${svc.name}-start`}
                          disabled={actionLoading !== null && actionLoading !== `${svc.name}-start`}
                          style={{
                            background: 'rgba(61, 255, 159, 0.08)',
                            color: 'var(--success)',
                            border: '1px solid rgba(61, 255, 159, 0.2)',
                          }}
                        >
                          Start
                        </Button>
                      </Popconfirm>
                    )}

                    {/* Restart */}
                    {actions.includes('restart') && (
                      <Popconfirm
                        title={`Restart ${svc.name}?`}
                        onConfirm={() => void handleAction(svc.name, 'restart')}
                        okText="Restart"
                        cancelText="Cancel"
                      >
                        <Button
                          id={`svc-${svc.name}-restart`}
                          size="small"
                          icon={<SyncOutlined />}
                          loading={actionLoading === `${svc.name}-restart`}
                          disabled={actionLoading !== null && actionLoading !== `${svc.name}-restart`}
                          style={{
                            background: 'rgba(100, 168, 255, 0.08)',
                            color: 'var(--info)',
                            border: '1px solid rgba(100, 168, 255, 0.2)',
                          }}
                        >
                          Restart
                        </Button>
                      </Popconfirm>
                    )}

                    {/* Stop */}
                    {actions.includes('stop') && (
                      svc.name === 'nginx' ? (
                        <Tooltip title="Nginx is serving this UI. Stopping it will make the Web Console inaccessible.">
                          <Button
                            id={`svc-${svc.name}-stop`}
                            size="small"
                            icon={<StopOutlined />}
                            danger
                            ghost
                            disabled
                            style={{ opacity: 0.35 }}
                          >
                            Stop
                          </Button>
                        </Tooltip>
                      ) : (
                        <Popconfirm
                          title={`Stop ${svc.name}?`}
                          description="This will stop the service. It can be restarted later."
                          onConfirm={() => void handleAction(svc.name, 'stop')}
                          okText="Stop"
                          okButtonProps={{ danger: true }}
                          cancelText="Cancel"
                        >
                          <Button
                            id={`svc-${svc.name}-stop`}
                            size="small"
                            icon={<StopOutlined />}
                            danger
                            ghost
                            loading={actionLoading === `${svc.name}-stop`}
                            disabled={actionLoading !== null && actionLoading !== `${svc.name}-stop`}
                            style={{ borderColor: 'rgba(255,95,126,0.3)' }}
                          >
                            Stop
                          </Button>
                        </Popconfirm>
                      )
                    )}

                    {actions.filter(a => a !== 'status').length === 0 && (
                      <Text style={{ color: 'var(--text-faint)', fontSize: 12 }}>No actions</Text>
                    )}
                  </Space>
                </div>

                {/* Raw systemctl output */}
                {svc.raw && (
                  <pre style={{
                    background: 'var(--bg-deep)',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    marginTop: 14,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}>
                    {svc.raw}
                  </pre>
                )}
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
