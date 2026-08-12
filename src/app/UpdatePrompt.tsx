import { useEffect, useState } from 'react'

/**
 * PWA update banner. Uses the virtual module injected by vite-plugin-pwa;
 * new versions are never applied silently — the user must tap "更新する". §54
 */
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateFn, setUpdateFn] = useState<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false
    // Dynamic import keeps this file harmless in non-PWA (e.g. plain `vite dev`)
    // environments where the virtual module may not be registered yet.
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (cancelled) return
        const update = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true)
          }
        })
        setUpdateFn(() => update)
      })
      .catch(() => {
        // PWA plugin not active (e.g. during local dev) — ignore.
      })
    return () => { cancelled = true }
  }, [])

  if (!needRefresh) return null

  return (
    <div className="update-banner">
      <span>新しいバージョンがあります。</span>
      <button onClick={() => updateFn?.()}>更新する</button>
    </div>
  )
}
