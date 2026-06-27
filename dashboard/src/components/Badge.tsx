// Badge component
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'muted'
  children: ReactNode
}

export function Badge({ variant = 'muted', children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  const variant =
    s === 'running' || s === 'online' || s === 'success'
      ? 'success'
      : s === 'stopped' || s === 'failed' || s === 'denied'
        ? 'danger'
        : 'muted'
  return <Badge variant={variant}>{status || '—'}</Badge>
}
