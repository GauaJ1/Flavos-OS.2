// SettingsPage — About & session management
import { useState } from 'react'
import {
  Card, Button, Space, Typography, Descriptions, Alert, Popconfirm,
  Badge, Divider, Tag, Row, Col,
} from 'antd'
import {
  InfoCircleOutlined, ApiOutlined, SafetyOutlined,
  PoweroffOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ControlOutlined,
} from '@ant-design/icons'
import { clearToken } from '../utils/security'
import { fetchHealth } from '../api/client'
import { AuthError } from '../types'

const { Text, Title } = Typography

interface SettingsPageProps {
  onLogout: () => void
  onUnauthorized: () => void
}

export function SettingsPage({ onLogout, onUnauthorized }: SettingsPageProps) {
  const [connStatus, setConnStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  const handleClearToken = () => {
    clearToken()
    onLogout()
  }

  const handleRefreshConnection = async () => {
    setConnStatus('checking')
    try {
      await fetchHealth()
      setConnStatus('ok')
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      setConnStatus('error')
    }
  }

  return (
    <div className="page-content">
      {/* Page header */}
      <div className="page-header">
        <div className="page-title-group">
          <ControlOutlined className="page-title-icon" />
          <h2 className="page-title">Settings & About</h2>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* About */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={
              <Space>
                <InfoCircleOutlined style={{ color: 'var(--accent-primary)' }} />
                <span>About</span>
              </Space>
            }
          >
            <Descriptions
              column={1}
              size="small"
              labelStyle={{
                color: 'var(--text-muted)',
                fontWeight: 500,
                width: 120,
                fontSize: 12,
                paddingBottom: 8,
              }}
              contentStyle={{ color: 'var(--text-main)', paddingBottom: 8, fontSize: 13 }}
            >
              <Descriptions.Item label="Project">
                <Text strong>Flavos OS 2.0</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Core">Flavos OS Core</Descriptions.Item>
              <Descriptions.Item label="Edition">
                <Tag
                  style={{
                    background: 'var(--accent-glow-soft)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--accent-primary)',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  Cloud Edition
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Console">
                <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  Web Console MVP v0.7.0
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Agent API">
                <Text code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  /api/v1
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Auth mode">
                <Text style={{ fontSize: 12 }}>Static token (X-Flavos-Token)</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Session">
                <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Stored in sessionStorage
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Session */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={
              <Space>
                <ApiOutlined style={{ color: 'var(--accent-primary)' }} />
                <span>Session</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Connection test */}
              <div>
                <Text style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>
                  Test connectivity to the Flavos Core Agent.
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <Button
                    id="settings-refresh-conn"
                    icon={<SyncOutlined spin={connStatus === 'checking'} />}
                    onClick={handleRefreshConnection}
                    loading={connStatus === 'checking'}
                    type="default"
                    ghost
                  >
                    Test Connection
                  </Button>
                  {connStatus === 'ok' && (
                    <Space size={6}>
                      <CheckCircleOutlined style={{ color: 'var(--success)' }} />
                      <Text style={{ color: 'var(--success)', fontSize: 13 }}>Agent reachable</Text>
                    </Space>
                  )}
                  {connStatus === 'error' && (
                    <Space size={6}>
                      <CloseCircleOutlined style={{ color: 'var(--danger)' }} />
                      <Text style={{ color: 'var(--danger)', fontSize: 13 }}>Agent unreachable</Text>
                    </Space>
                  )}
                </div>
              </div>

              <Divider style={{ borderColor: 'var(--border)', margin: '4px 0' }} />

              {/* Logout */}
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 12 }}>
                  Clears the session token from storage and returns to the login screen.
                </Text>
                <Popconfirm
                  title="Clear token & logout"
                  description="Your session token will be cleared. You'll need to re-enter it to access the console."
                  okText="Logout"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleClearToken}
                >
                  <Button
                    id="settings-logout"
                    icon={<PoweroffOutlined />}
                    danger
                    type="primary"
                  >
                    Clear Token & Logout
                  </Button>
                </Popconfirm>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Security notice */}
        <Col xs={24}>
          <Card
            bordered={false}
            style={{ borderColor: 'rgba(255,209,102,0.2)' }}
            title={
              <Space>
                <SafetyOutlined style={{ color: 'var(--warning)' }} />
                <Title level={5} style={{ margin: 0, color: 'var(--warning)' }}>
                  Security Notice
                </Title>
              </Space>
            }
          >
            <Alert
              type="warning"
              showIcon={false}
              style={{
                background: 'rgba(255,209,102,0.05)',
                border: '1px solid rgba(255,209,102,0.20)',
                borderRadius: 8,
              }}
              message={
                <div>
                  <Text strong style={{ color: 'var(--warning)', display: 'block', marginBottom: 8 }}>
                    Este Web Console é um MVP local/lab.
                  </Text>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block', marginBottom: 10 }}>
                    Não exponha em produção sem HTTPS, reverse proxy seguro e hardening completo.
                  </Text>
                  <Space direction="vertical" size={4}>
                    {[
                      'Token estático sem expiração automática',
                      'Sem RBAC ou multi-usuário',
                      'Sem HTTPS obrigatório nesta versão',
                      'Não recomendado expor publicamente',
                    ].map((item, i) => (
                      <Space key={i} size={6}>
                        <Badge status="warning" />
                        <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>{item}</Text>
                      </Space>
                    ))}
                  </Space>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
