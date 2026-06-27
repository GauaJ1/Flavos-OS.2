// LoginPage — token-based authentication
import { useState } from 'react'
import { fetchStatus } from '../api/client'
import { setToken, clearToken } from '../utils/security'
import { AuthError, ApiError } from '../types'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [tokenInput, setTokenInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = tokenInput.trim()
    if (!trimmed) {
      setError('Token é obrigatório.')
      return
    }

    setLoading(true)
    setError(null)

    // Temporarily store to allow the API call to use it
    setToken(trimmed)

    try {
      await fetchStatus()
      // Clear the input for security (don't keep it in DOM state)
      setTokenInput('')
      onLogin()
    } catch (err) {
      // Remove invalid token
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
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">F</div>
          <h1 className="login-title">Flavos OS 2.0</h1>
          <p className="login-subtitle">Web Console</p>
        </div>

        <p className="login-description">Connect to your Flavos Core Agent</p>

        <form onSubmit={handleConnect} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-token" className="form-label">
              Agent Token
            </label>
            <input
              id="login-token"
              type="password"
              className={`form-input ${error ? 'form-input-error' : ''}`}
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Enter your agent token"
              autoComplete="current-password"
              disabled={loading}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          {error && (
            <div id="login-error" className="form-error" role="alert">
              {error}
            </div>
          )}

          <button
            id="login-connect"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !tokenInput.trim()}
          >
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </form>

        <p className="login-hint">
          Token is stored only for this session and never sent via URL.
        </p>
      </div>
    </div>
  )
}
