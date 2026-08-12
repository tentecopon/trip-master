import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { createAutoBackupIfNeeded } from '@/services/backupService'
import { ToastProvider } from '@/components/common/Toast'
import { UpdatePrompt } from './UpdatePrompt'

/** App shell: bottom nav (mobile-first per §59) + routed page content. */
export function App() {
  useEffect(() => {
    createAutoBackupIfNeeded().catch(() => {
      // Auto-backup failures are non-fatal on startup; the user can still
      // trigger a manual backup from Settings.
    })
  }, [])

  return (
    <ToastProvider>
      <div className="app-shell">
        <main className="app-main">
          <Outlet />
        </main>
        <nav className="bottom-nav">
          <NavLink to="/" end className="bottom-nav-item">ホーム</NavLink>
          <NavLink to="/trips" className="bottom-nav-item">出張</NavLink>
          <NavLink to="/history" className="bottom-nav-item">履歴</NavLink>
          <NavLink to="/settings" className="bottom-nav-item">設定</NavLink>
        </nav>
        <UpdatePrompt />
      </div>
    </ToastProvider>
  )
}
