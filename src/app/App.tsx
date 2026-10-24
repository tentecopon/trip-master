import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { createAutoBackupIfNeeded } from '@/services/backupService'
import { ToastProvider } from '@/components/common/Toast'
import { UpdatePrompt } from './UpdatePrompt'

/** App shell: bottom nav (mobile-first per §59) + routed page content. */
export function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    createAutoBackupIfNeeded().catch(() => {
      // Auto-backup failures are non-fatal on startup; the user can still
      // trigger a manual backup from Settings.
    })
  }, [])

  return (
    <ToastProvider>
      <div className="app-shell">
        <button
          type="button"
          className="app-menu-toggle"
          aria-label="メニューを開く"
          aria-expanded={menuOpen}
          aria-controls="app-menu"
          onClick={() => setMenuOpen(open => !open)}
        >
          ☰
        </button>

        {menuOpen && <button type="button" className="app-menu-backdrop" aria-label="メニューを閉じる" onClick={() => setMenuOpen(false)} />}
        <nav id="app-menu" className={`app-menu ${menuOpen ? 'app-menu-open' : ''}`} aria-label="メインメニュー">
          <div className="app-menu-title">メニュー</div>
          <NavLink to="/" end className="app-menu-item" onClick={() => setMenuOpen(false)}>ホーム</NavLink>
          <NavLink to="/trips" className="app-menu-item" onClick={() => setMenuOpen(false)}>出張</NavLink>
          <NavLink to="/history" className="app-menu-item" onClick={() => setMenuOpen(false)}>履歴</NavLink>
          <NavLink to="/templates" className="app-menu-item" onClick={() => setMenuOpen(false)}>テンプレート</NavLink>
          <NavLink to="/settings" className="app-menu-item" onClick={() => setMenuOpen(false)}>設定</NavLink>
        </nav>

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
