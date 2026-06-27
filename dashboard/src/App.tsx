// App.tsx — root component with routing
import { useState, useCallback, useEffect } from 'react'
import { hasToken, clearToken } from './utils/security'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ServicesPage } from './pages/ServicesPage'
import { LogsPage } from './pages/LogsPage'
import { AuditPage } from './pages/AuditPage'
import { SettingsPage } from './pages/SettingsPage'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import type { Page } from './types'
import { fetchStatus } from './api/client'

function App() {
  const [authenticated, setAuthenticated] = useState(hasToken)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)
  const [hostname, setHostname] = useState<string | undefined>(undefined)
  const [agentStatus, setAgentStatus] = useState<string>('connecting')

  const handleLogin = useCallback(() => {
    setAuthenticated(true)
    setRefreshKey(k => k + 1)
  }, [])

  const handleLogout = useCallback(() => {
    clearToken()
    setAuthenticated(false)
    setHostname(undefined)
    setAgentStatus('connecting')
  }, [])

  const handleUnauthorized = useCallback(() => {
    clearToken()
    setAuthenticated(false)
    setHostname(undefined)
    setAgentStatus('connecting')
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // Load hostname/status for the header
  useEffect(() => {
    if (!authenticated) return
    fetchStatus()
      .then(s => {
        setHostname(s.hostname)
        setAgentStatus(s.agent ?? 'online')
      })
      .catch(() => {
        setAgentStatus('error')
      })
  }, [authenticated, refreshKey])

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  const renderPage = () => {
    const props = { onUnauthorized: handleUnauthorized, refreshKey }
    switch (currentPage) {
      case 'dashboard': return <DashboardPage {...props} />
      case 'services': return <ServicesPage {...props} />
      case 'logs': return <LogsPage {...props} />
      case 'audit': return <AuditPage {...props} />
      case 'settings': return <SettingsPage onLogout={handleLogout} onUnauthorized={handleUnauthorized} />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="app-main">
        <Header
          hostname={hostname}
          agentStatus={agentStatus}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
        />
        <main className="app-content">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
