// Badge component
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'muted'
  children: ReactNode
  noDot?: boolean
}

export function Badge({ variant = 'muted', children, noDot }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}${noDot ? ' badge-no-dot' : ''}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  const variant =
    s === 'running' || s === 'online' || s === 'success'
      ? 'success'
      : s === 'stopped' || s === 'failed' || s === 'denied' || s === 'error'
        ? 'danger'
        : s === 'warning' || s === 'degraded'
          ? 'warning'
          : 'muted'
  return <Badge variant={variant}>{status || '—'}</Badge>
}

// Topbar / hero status dot (with pulse animation for online)
export function AgentStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  const cls =
    s === 'online' || s === 'running'
      ? 'status-online'
      : s === 'error' || s === 'offline' || s === 'failed'
        ? 'status-offline'
        : 'status-degraded'
  return <span className={cls}>{status || 'unknown'}</span>
}
