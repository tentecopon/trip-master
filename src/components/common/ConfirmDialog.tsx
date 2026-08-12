import { Modal } from './Modal'
import { Button } from './Button'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Generic yes/no dialog used for Trip delete, Trip complete, WorkLog-out-of-range, JSON restore, etc. §43 */
export function ConfirmDialog({ open, title, message, confirmLabel = '実行', danger, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <Button variant="ghost" onClick={onCancel}>キャンセル</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
