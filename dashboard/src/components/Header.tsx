import { Layout, Button, Space, Typography } from 'antd'
import { ReloadOutlined, LogoutOutlined } from '@ant-design/icons'
import { clearToken } from '../utils/security'
import type { Page } from '../types'

const { Header: AntHeader } = Layout
const { Text } = Typography

const PAGE_LABELS: Record<Page, string> = {
  dashboard: 'Dashboard',
  services:  'Services',
  logs:      'Logs',
  audit:     'Audit Log',
  settings:  'Settings & About',
}

interface HeaderProps {
  hostname?:    string
  agentStatus?: string
  currentPage?: Page
  onLogout:     () => void
  onRefresh:    () => void
}

export function Header({ hostname, agentStatus, currentPage, onLogout, onRefresh }: HeaderProps) {
  const handleLogout = () => {
    clearToken()
    onLogout()
  }

  const dotClass = (() => {
    const s = (agentStatus ?? 'connecting').toLowerCase()
    if (s === 'online' || s === 'running') return 'host-dot'
    if (s === 'connecting') return 'host-dot dot-connecting'
    return 'host-dot dot-error'
  })()

  const pageLabel = currentPage ? PAGE_LABELS[currentPage] : ''

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 'var(--header-h)',
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left — page breadcrumb + host badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {pageLabel && (
          <Text
            style={{
              fontSize: 12,
              color: 'var(--text-faint)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {pageLabel}
          </Text>
        )}
        {hostname && (
          <div className="header-host-badge">
            <span className={dotClass} />
            {hostname}
          </div>
        )}
      </div>

      {/* Right — actions */}
      <Space size={4}>
        <Button
          id="header-refresh"
          type="text"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          title="Refresh data"
          aria-label="Refresh data"
          style={{ color: 'var(--text-muted)' }}
        />
        <Button
          id="header-logout"
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          title="Logout"
          style={{ color: 'var(--text-muted)' }}
        >
          Logout
        </Button>
      </Space>
    </AntHeader>
  )
}
