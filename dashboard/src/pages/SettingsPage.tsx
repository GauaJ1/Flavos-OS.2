// SettingsPage — About & session management
import { clearToken } from '../utils/security'
import { fetchHealth } from '../api/client'
import { useState } from 'react'
import { Card } from '../components/Card'
import { AuthError } from '../types'

interface SettingsPageProps {
  onLogout: () => void
  onUnauthorized: () => void
}

export function SettingsPage({ onLogout, onUnauthorized }: SettingsPageProps) {
  const [connStatus, setConnStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const handleClearToken = () => {
    clearToken()
    onLogout()
  }

  const handleRefreshConnection = async () => {
    setConnStatus('idle')
    try {
      await fetchHealth()
      setConnStatus('ok')
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      setConnStatus('error')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Settings & About</h2>
      </div>

      <Card title="About" className="mb-4">
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">Project</span>
            <span className="info-value">Flavos OS 2.0</span>
          </div>
          <div className="info-row">
            <span className="info-label">Core</span>
            <span className="info-value">Flavos OS Core</span>
          </div>
          <div className="info-row">
            <span className="info-label">Edition</span>
            <span className="info-value">Cloud Edition</span>
          </div>
          <div className="info-row">
            <span className="info-label">Console</span>
            <span className="info-value">Web Console MVP v0.7.0</span>
          </div>
          <div className="info-row">
            <span className="info-label">Agent API</span>
            <span className="info-value mono">/api/v1</span>
          </div>
          <div className="info-row">
            <span className="info-label">Auth mode</span>
            <span className="info-value">Static token (X-Flavos-Token)</span>
          </div>
          <div className="info-row">
            <span className="info-label">Session</span>
            <span className="info-value">Token stored in sessionStorage</span>
          </div>
        </div>
      </Card>

      <Card title="Session" className="mb-4">
        <div className="settings-actions">
          <button
            id="settings-refresh-conn"
            className="btn btn-ghost"
            onClick={handleRefreshConnection}
          >
            Refresh Connection
          </button>
          {connStatus === 'ok' && <span className="badge badge-success">Agent reachable</span>}
          {connStatus === 'error' && <span className="badge badge-danger">Agent unreachable</span>}
        </div>
        <div className="settings-actions mt-2">
          <button
            id="settings-logout"
            className="btn btn-danger"
            onClick={handleClearToken}
          >
            Clear Token & Logout
          </button>
        </div>
      </Card>

      <Card title="Security Warning" className="mb-4">
        <div className="alert alert-warning">
          <p>
            Este Web Console é um <strong>MVP local/lab</strong>. Não exponha em produção sem HTTPS,
            reverse proxy seguro e hardening completo.
          </p>
          <ul className="warning-list">
            <li>Token estático sem expiração automática</li>
            <li>Sem RBAC ou multi-usuário</li>
            <li>Sem HTTPS obrigatório nesta versão</li>
            <li>Não recomendado expor publicamente</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
