// Header component
import { StatusBadge } from './Badge'
import { clearToken } from '../utils/security'

interface HeaderProps {
  hostname?: string
  agentStatus?: string
  onLogout: () => void
  onRefresh: () => void
}

export function Header({ hostname, agentStatus, onLogout, onRefresh }: HeaderProps) {
  const handleLogout = () => {
    clearToken()
    onLogout()
  }

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-host">{hostname ?? 'Connecting…'}</span>
        <StatusBadge status={agentStatus ?? 'connecting'} />
      </div>
      <div className="header-right">
        <button
          id="header-refresh"
          className="btn btn-icon"
          onClick={onRefresh}
          title="Refresh"
          aria-label="Refresh data"
        >
          ↻
        </button>
        <button
          id="header-logout"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
