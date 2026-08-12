import { useRef, useState } from 'react'
import type { Backup } from '@/types/backup'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { useBackup } from '@/hooks/useBackup'

/** Export/import/restore UI, combining BackupExport + BackupImport + RestoreConfirm. §22, §43, §49–§51 */
export function BackupPanel() {
  const { backups, exportNow, validateFile, restore } = useBackup()
  const { show } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingRaw, setPendingRaw] = useState<string | null>(null)
  const [invalidReason, setInvalidReason] = useState<string | null>(null)

  async function handleExport() {
    try {
      await exportNow()
      show('バックアップを作成しました。')
    } catch {
      show('バックアップを作成できませんでした。', 'error')
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { raw, outcome } = await validateFile(file)
      if (!outcome.valid) {
        setInvalidReason(outcome.reason ?? 'このファイルは使用できません。')
        return
      }
      setPendingRaw(raw)
    } catch {
      show('バックアップデータを読み込めませんでした。', 'error')
    }
  }

  async function handleConfirmRestore() {
    if (!pendingRaw) return
    try {
      await restore(pendingRaw)
      show('データを復元しました。')
    } catch {
      show('データを復元できませんでした。現在のデータは変更されていません。', 'error')
    } finally {
      setPendingRaw(null)
    }
  }

  return (
    <div className="backup-panel">
      <div className="backup-actions">
        <Button variant="primary" onClick={handleExport}>JSONバックアップを作成</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>JSONから復元</Button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
      </div>

      <div className="backup-list">
        <div className="field-label">保存済みバックアップ（最大3世代）</div>
        {backups.length === 0 && <p className="empty-state">まだバックアップがありません。</p>}
        <ul>
          {backups.map((b: Backup) => (
            <li key={b.id} className="backup-list-item">
              {new Date(b.createdAt).toLocaleString('ja-JP')}
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={pendingRaw !== null}
        title="データを復元しますか？"
        message="現在のデータはすべて置き換えられます。復元前に現在のデータは自動的にバックアップされます。"
        confirmLabel="復元する"
        danger
        onConfirm={handleConfirmRestore}
        onCancel={() => setPendingRaw(null)}
      />

      <ConfirmDialog
        open={invalidReason !== null}
        title="このファイルは使用できません"
        message={invalidReason ?? ''}
        confirmLabel="閉じる"
        onConfirm={() => setInvalidReason(null)}
        onCancel={() => setInvalidReason(null)}
      />
    </div>
  )
}
