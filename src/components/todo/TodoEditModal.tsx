import { useState } from 'react'
import type { Todo, TodoInput, TodoPhase } from '@/types/todo'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { DateInput } from '@/components/common/DateInput'

interface Props {
  open: boolean
  phase: TodoPhase
  initial?: Todo
  onClose: () => void
  onSave: (input: TodoInput) => void | Promise<void>
  onDelete?: () => void | Promise<void>
}

/** Combined create/edit form for a single Todo (title, phase fixed by section, due date, comment). §45 */
export function TodoEditModal({ open, phase, initial, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!title.trim()) {
      setError('タイトルは必須です。')
      return
    }
    await onSave({ title, phase, dueDate, comment })
    onClose()
  }

  return (
    <Modal open={open} title={initial ? 'ToDoを編集' : 'ToDoを追加'} onClose={onClose}>
      <div className="form">
        {error && <div className="form-error">{error}</div>}
        <label className="field">
          <span className="field-label">タイトル<span className="required">*</span></span>
          <input className="field-input" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        </label>
        <DateInput label="予定日" value={dueDate} onChange={setDueDate} />
        <label className="field">
          <span className="field-label">コメント</span>
          <textarea className="field-input" rows={2} value={comment} onChange={e => setComment(e.target.value)} />
        </label>
        <div className="confirm-actions">
          {initial && onDelete && (
            <Button variant="danger" onClick={onDelete} type="button">削除</Button>
          )}
          <Button variant="ghost" onClick={onClose} type="button">キャンセル</Button>
          <Button variant="primary" onClick={handleSave} type="button">保存</Button>
        </div>
      </div>
    </Modal>
  )
}
