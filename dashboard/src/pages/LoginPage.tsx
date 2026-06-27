import { useState } from 'react'
import { Card, Input, Button, Alert, Form, Typography, Space } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { fetchStatus } from '../api/client'
import { setToken, clearToken } from '../utils/security'
import { AuthError, ApiError } from '../types'

const { Text, Title } = Typography

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [tokenInput, setTokenInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    const trimmed = tokenInput.trim()
    if (!trimmed) {
      setError('Token é obrigatório.')
      return
    }

    setLoading(true)
    setError(null)
    setToken(trimmed)

    try {
      await fetchStatus()
      setTokenInput('')
      onLogin()
    } catch (err) {
      clearToken()
      if (err instanceof AuthError) {
        setError('Token inválido ou sem permissão.')
      } else if (err instanceof ApiError && err.code === 'timeout') {
        setError('Timeout: não foi possível conectar ao Flavos Core Agent.')
      } else {
        setError('Não foi possível conectar ao Flavos Core Agent.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card-wrapper">
        {/* Glowing ring */}
        <div className="login-glow-ring" />

        <Card className="login-card" bordered={false}>
          {/* Brand */}
          <Space direction="vertical" size={10} style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            <div className="login-logo">F</div>
            <div style={{ textAlign: 'center' }}>
              <Title
                level={4}
                style={{ margin: 0, color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.3px' }}
              >
                Flavos OS 2.0
              </Title>
              <Text
                style={{
                  fontSize: 10,
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                }}
              >
                Cloud Console
              </Text>
            </div>
            <Text style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              Connect to your Flavos Core Agent
            </Text>
          </Space>

          {/* Form */}
          <Form layout="vertical" onFinish={handleConnect} noValidate>
            <Form.Item
              label={
                <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Agent Token
                </span>
              }
              required
              validateStatus={error ? 'error' : undefined}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                id="login-token"
                prefix={<LockOutlined style={{ color: 'var(--text-faint)' }} />}
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="Enter your agent token"
                autoComplete="current-password"
                disabled={loading}
                size="large"
              />
            </Form.Item>

            {error && (
              <Alert
                id="login-error"
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                id="login-connect"
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                disabled={!tokenInput.trim()}
                style={{ fontWeight: 600, height: 44 }}
              >
                {loading ? 'Connecting…' : 'Connect'}
              </Button>
            </Form.Item>
          </Form>

          <Text
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-faint)',
              lineHeight: 1.5,
            }}
          >
            Token is stored only for this session and never sent via URL.
          </Text>
        </Card>
      </div>
    </div>
  )
}
