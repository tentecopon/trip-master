import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface ToastMessage {
  id: string
  text: string
  kind: 'info' | 'error'
}

interface ToastContextValue {
  show: (text: string, kind?: ToastMessage['kind']) => void
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

/** §44 — lightweight, self-dismissing toast for save/backup/restore errors. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const show = useCallback((text: string, kind: ToastMessage['kind'] = 'info') => {
    const id = crypto.randomUUID()
    setMessages(prev => [...prev, { id, text, kind }])
    setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-stack">
        {messages.map(m => (
          <div key={m.id} className={`toast toast-${m.kind}`}>{m.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
