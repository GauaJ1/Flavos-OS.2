// ServicesPage — list and control runit services
import { useState, useEffect, useCallback } from 'react'
import { fetchServices, serviceAction } from '../api/client'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { AuthError, ApiError } from '../types'
import type { ServiceItem } from '../types'

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
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null)
  const [confirm, setConfirm] = useState<{
    service: string
    action: ActionType
  } | null>(null)

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

  const showToast = (message: string, variant: 'success' | 'danger') => {
    setToast({ message, variant })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAction = async (name: string, action: ActionType) => {
    const key = `${name}-${action}`
    setActionLoading(key)
    try {
      await serviceAction(name, action)
      showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} executed on ${name}.`, 'success')
      await load()
    } catch (err) {
      if (err instanceof AuthError) { onUnauthorized(); return }
      const code = err instanceof ApiError ? err.code : 'unknown_error'
      showToast(`Action blocked: ${code}`, 'danger')
    } finally {
      setActionLoading(null)
      setConfirm(null)
    }
  }

  const requestConfirm = (service: string, action: ActionType) => {
    setConfirm({ service, action })
  }

  if (loading) return <LoadingState message="Loading services…" />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (services.length === 0) return <EmptyState message="No services available." />

  const actionVariant = (a: ActionType): 'danger' | 'warning' => a === 'stop' ? 'danger' : 'warning'

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Services</h2>
        <button id="services-refresh" className="btn btn-icon" onClick={load} title="Refresh">↻</button>
      </div>

      {toast && (
        <div className={`toast toast-${toast.variant}`} role="alert">{toast.message}</div>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Confirm ${confirm.action} on ${confirm.service}?`}
          variant={actionVariant(confirm.action)}
          onConfirm={() => void handleAction(confirm.service, confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="services-list">
        {services.map(svc => {
          const actions = svc.allowed_actions ?? []
          return (
            <Card key={svc.name} className="service-card">
              <div className="service-header">
                <div className="service-name-group">
                  <span className="service-name mono">{svc.name}</span>
                  <StatusBadge status={svc.status} />
                </div>
                <div className="service-actions">
                  {actions.includes('start') && (
                    <button
                      id={`svc-${svc.name}-start`}
                      className="btn btn-sm btn-success"
                      disabled={actionLoading === `${svc.name}-start`}
                      onClick={() => requestConfirm(svc.name, 'start')}
                    >
                      Start
                    </button>
                  )}
                  {actions.includes('restart') && (
                    <button
                      id={`svc-${svc.name}-restart`}
                      className="btn btn-sm btn-warning"
                      disabled={actionLoading === `${svc.name}-restart`}
                      onClick={() => requestConfirm(svc.name, 'restart')}
                    >
                      Restart
                    </button>
                  )}
                  {actions.includes('stop') && (
                    <button
                      id={`svc-${svc.name}-stop`}
                      className="btn btn-sm btn-danger"
                      disabled={actionLoading === `${svc.name}-stop`}
                      onClick={() => requestConfirm(svc.name, 'stop')}
                    >
                      Stop
                    </button>
                  )}
                  {actions.filter(a => a !== 'status').length === 0 && (
                    <span className="text-muted text-sm">No actions</span>
                  )}
                </div>
              </div>
              {svc.raw && (
                <div className="service-raw mono text-sm text-muted">{svc.raw}</div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
