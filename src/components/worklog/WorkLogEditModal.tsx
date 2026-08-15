import { useEffect, useState } from 'react'
import type { WorkLog } from '@/types/workLog'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface Props {
  open: boolean
  workLog: WorkLog
  onClose: () => void
  onSave: (input: { date: string; startTime: string; endTime: string }) => void | Promise<void>
  onDelete: () => void | Promise<void>
}

/** Manual correction of a WorkLog entry — one of the "save-button" flows (§46). */
export function WorkLogEditModal({ open, workLog, onClose, onSave, onDelete }: Props) {
  const [date, setDate] = useState(workLog.date)
  const [startTime, setStartTime] = useState(workLog.startTime)
  const [endTime, setEndTime] = useState(workLog.endTime)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setDate(workLog.date)
    setStartTime(workLog.startTime)
    setEndTime(workLog.endTime)
  }, [open, workLog.id])

  async function handleSave() {
    await onSave({ date, startTime, endTime })
    onClose()
  }

  async function handleDelete() {
    await onDelete()
    setConfirmDelete(false)
    onClose()
  }

  return (
    <Modal open={open} title="作業時間を修正" onClose={onClose}>
      <div className="form">
        <label className="field">
          <span className="field-label">日付</span>
          <input type="date" className="field-input" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field-label">開始時刻</span>
            <input type="time" className="field-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">終了時刻</span>
            <input type="time" className="field-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </label>
        </div>
        <div className="confirm-actions">
          <Button variant="danger" onClick={() => setConfirmDelete(true)} type="button">削除</Button>
          <Button variant="ghost" onClick={onClose} type="button">キャンセル</Button>
          <Button variant="primary" onClick={handleSave} type="button">保存</Button>
        </div>
        <ConfirmDialog
          open={confirmDelete}
          title="作業時間を削除しますか？"
          message="この作業時間の記録を削除します。"
          confirmLabel="削除"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>
    </Modal>
  )
}
