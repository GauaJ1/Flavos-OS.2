// Sidebar navigation
import type { Page } from '../types'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const NAV_ITEMS: { page: Page; label: string; icon: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { page: 'services', label: 'Services', icon: '⚙' },
  { page: 'logs', label: 'Logs', icon: '≡' },
  { page: 'audit', label: 'Audit', icon: '⊙' },
  { page: 'settings', label: 'Settings', icon: '◈' },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <div className="brand-logo">F</div>
        <div className="brand-text">
          <span className="brand-name">Flavos OS</span>
          <span className="brand-edition">Cloud Console</span>
        </div>
      </div>
      <ul className="sidebar-nav" role="list">
        {NAV_ITEMS.map(({ page, label, icon }) => (
          <li key={page}>
            <button
              id={`nav-${page}`}
              className={`nav-item ${currentPage === page ? 'active' : ''}`}
              onClick={() => onNavigate(page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <span className="version-label">v0.7.0 MVP</span>
      </div>
    </nav>
  )
}
