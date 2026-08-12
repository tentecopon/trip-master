import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMasters } from '@/hooks/useMasters'
import { Button } from '@/components/common/Button'
import { BackupPanel } from '@/components/backup/BackupPanel'

/** §28 — machine/purpose masters, templates link, backup/restore, app info. */
export function SettingsPage() {
  const { machines, purposes, addMachine, removeMachine, addPurpose, removePurpose } = useMasters()
  const [newMachine, setNewMachine] = useState('')
  const [newPurpose, setNewPurpose] = useState('')

  return (
    <div className="page">
      <h1 className="page-title">設定</h1>

      <section className="settings-section">
        <h3>装置マスター</h3>
        <ul className="master-list">
          {machines.map(m => (
            <li key={m.id}>
              <span>{m.name}</span>
              <Button variant="danger" onClick={() => removeMachine(m.id)}>削除</Button>
            </li>
          ))}
        </ul>
        <div className="master-add-row">
          <input className="field-input" value={newMachine} onChange={e => setNewMachine(e.target.value)} placeholder="装置名" />
          <Button variant="primary" onClick={() => { if (newMachine.trim()) { addMachine(newMachine.trim()); setNewMachine('') } }}>追加</Button>
        </div>
      </section>

      <section className="settings-section">
        <h3>目的マスター</h3>
        <ul className="master-list">
          {purposes.map(p => (
            <li key={p.id}>
              <span>{p.name}</span>
              <Button variant="danger" onClick={() => removePurpose(p.id)}>削除</Button>
            </li>
          ))}
        </ul>
        <div className="master-add-row">
          <input className="field-input" value={newPurpose} onChange={e => setNewPurpose(e.target.value)} placeholder="目的名" />
          <Button variant="primary" onClick={() => { if (newPurpose.trim()) { addPurpose(newPurpose.trim()); setNewPurpose('') } }}>追加</Button>
        </div>
      </section>

      <section className="settings-section">
        <h3>ToDoテンプレート</h3>
        <Link to="/templates"><Button variant="secondary">テンプレート管理を開く</Button></Link>
      </section>

      <section className="settings-section">
        <h3>バックアップ / 復元</h3>
        <BackupPanel />
      </section>

      <section className="settings-section">
        <h3>アプリ情報</h3>
        <p>出張管理ツール ベータ版 (v0.1)</p>
      </section>
    </div>
  )
}
