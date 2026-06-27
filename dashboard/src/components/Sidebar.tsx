import { Layout } from 'antd'
import { Menu } from 'antd'
import {
  DashboardOutlined,
  SettingOutlined,
  FileTextOutlined,
  AuditOutlined,
  ControlOutlined,
} from '@ant-design/icons'
import type { Page } from '../types'

const { Sider } = Layout

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined id="nav-dashboard" /> },
  { key: 'services',  label: 'Services',  icon: <SettingOutlined  id="nav-services"  /> },
  { key: 'logs',      label: 'Logs',      icon: <FileTextOutlined id="nav-logs"      /> },
  { key: 'audit',     label: 'Audit',     icon: <AuditOutlined    id="nav-audit"     /> },
  { key: 'settings',  label: 'Settings',  icon: <ControlOutlined  id="nav-settings"  /> },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <Sider
      width={240}
      theme="dark"
      style={{
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Brand header */}
      <div className="sidebar-brand">
        <div className="brand-logo">F</div>
        <div className="brand-text">
          <span className="brand-name">Flavos OS</span>
          <span className="brand-edition">Cloud Console</span>
        </div>
      </div>

      {/* Navigation menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentPage]}
        onClick={({ key }) => onNavigate(key as Page)}
        items={menuItems}
        style={{
          background: 'transparent',
          borderRight: 0,
          flex: 1,
          paddingTop: 8,
        }}
      />

      {/* Footer version label */}
      <div className="sidebar-footer">
        <span className="version-label">v0.7.0 · MVP</span>
      </div>
    </Sider>
  )
}
