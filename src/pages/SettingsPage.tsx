import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMasters } from '@/hooks/useMasters'
import { Button } from '@/components/common/Button'
import { BackupPanel } from '@/components/backup/BackupPanel'
import { Modal } from '@/components/common/Modal'
import { useToast } from '@/components/common/Toast'

type EditingMaster = { kind: 'machine' | 'purpose'; id: string; name: string } | null

/** §28 — machine/purpose masters, templates link, backup/restore, app info. */
export function SettingsPage() {
  const { machines, purposes, addMachine, editMachine, removeMachine, addPurpose, editPurpose, removePurpose } = useMasters()
  const [newMachine, setNewMachine] = useState('')
  const [newPurpose, setNewPurpose] = useState('')
  const [editing, setEditing] = useState<EditingMaster>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { show } = useToast()

  useEffect(() => {
    setEditName(editing?.name ?? '')
    setError(null)
  }, [editing])

  async function saveMasterEdit() {
    if (!editing) return
    try {
      if (editing.kind === 'machine') await editMachine(editing.id, editName)
      else await editPurpose(editing.id, editName)
      setEditing(null)
    } catch (e) {
      setError((e as Error).message || 'データを保存できませんでした。')
    }
  }

  async function addMaster(kind: 'machine' | 'purpose') {
    const name = kind === 'machine' ? newMachine : newPurpose
    try {
      if (kind === 'machine') {
        await addMachine(name)
        setNewMachine('')
      } else {
        await addPurpose(name)
        setNewPurpose('')
      }
    } catch (e) {
      show((e as Error).message || 'データを保存できませんでした。', 'error')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">設定</h1>

      <section className="settings-section">
        <h3>装置マスター</h3>
        <ul className="master-list">
          {machines.map(m => (
            <li key={m.id}>
              <span className="master-name">{m.name}</span>
              <div className="master-actions">
                <Button variant="secondary" onClick={() => setEditing({ kind: 'machine', id: m.id, name: m.name })}>編集</Button>
                <Button variant="danger" onClick={() => removeMachine(m.id)}>削除</Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="master-add-row">
          <input className="field-input" value={newMachine} onChange={e => setNewMachine(e.target.value)} placeholder="装置名" />
          <Button variant="primary" onClick={() => addMaster('machine')}>追加</Button>
        </div>
      </section>

      <section className="settings-section">
        <h3>目的マスター</h3>
        <ul className="master-list">
          {purposes.map(p => (
            <li key={p.id}>
              <span className="master-name">{p.name}</span>
              <div className="master-actions">
                <Button variant="secondary" onClick={() => setEditing({ kind: 'purpose', id: p.id, name: p.name })}>編集</Button>
                <Button variant="danger" onClick={() => removePurpose(p.id)}>削除</Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="master-add-row">
          <input className="field-input" value={newPurpose} onChange={e => setNewPurpose(e.target.value)} placeholder="目的名" />
          <Button variant="primary" onClick={() => addMaster('purpose')}>追加</Button>
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
        <p>出張管理ツール 全体修正（V0.2）</p>
        <p>詳細画面のボタン位置変更（V0.2.1）</p>
      </section>

      <Modal open={editing !== null} title={editing?.kind === 'machine' ? '装置マスターを編集' : '目的マスターを編集'} onClose={() => setEditing(null)}>
        <div className="form">
          {error && <div className="form-error">{error}</div>}
          <label className="field">
            <span className="field-label">名称<span className="required">*</span></span>
            <input className="field-input" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
          </label>
          <div className="confirm-actions">
            <Button variant="ghost" type="button" onClick={() => setEditing(null)}>キャンセル</Button>
            <Button variant="primary" type="button" onClick={saveMasterEdit}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
