import { useState } from 'react'
import type { WorkLog } from '@/types/workLog'
import type { Trip } from '@/types/trip'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { WorkLogEditModal } from './WorkLogEditModal'
import { isOutsideTripPeriod } from '@/services/workLogService'
import { todayStr } from '@/utils/date'

interface Props {
  trip: Trip
  workLogs: WorkLog[]
  todayLog: WorkLog | undefined
  onStart: () => Promise<void>
  onEnd: () => Promise<void>
  onUpdate: (id: string, input: { date: string; startTime: string; endTime: string }) => Promise<void>
}

/** Today's start/end controls plus the trip's work-time history. §36–§39, §46 */
export function WorkLogSection({ trip, workLogs, todayLog, onStart, onEnd, onUpdate }: Props) {
  const [editing, setEditing] = useState<WorkLog | null>(null)
  const [pendingAction, setPendingAction] = useState<'start' | 'end' | null>(null)

  const today = todayStr()
  const outOfRange = isOutsideTripPeriod(today, trip.startDate, trip.endDate)

  async function handleStartClick() {
    if (outOfRange) { setPendingAction('start'); return }
    await onStart()
  }
  async function handleEndClick() {
    if (outOfRange) { setPendingAction('end'); return }
    await onEnd()
  }
  async function confirmPending() {
    if (pendingAction === 'start') await onStart()
    if (pendingAction === 'end') await onEnd()
    setPendingAction(null)
  }

  return (
    <section className="worklog-section">
      <div className="todo-section-header">
        <h3>作業時間</h3>
      </div>

      <div className="worklog-today">
        {!todayLog && <Button variant="primary" onClick={handleStartClick}>作業開始</Button>}
        {todayLog && !todayLog.endTime && (
          <>
            <span className="worklog-status">開始 {todayLog.startTime}</span>
            <Button variant="primary" onClick={handleEndClick}>作業終了</Button>
          </>
        )}
        {todayLog && todayLog.endTime && (
          <span className="worklog-status">本日: {todayLog.startTime} 〜 {todayLog.endTime}</span>
        )}
      </div>

      {workLogs.length === 0 ? (
        <EmptyState message="作業時間の記録はまだありません。" />
      ) : (
        <ul className="worklog-list">
          {workLogs.map(w => (
            <li key={w.id} className="worklog-item" onClick={() => setEditing(w)}>
              <span className="worklog-date">{w.date}</span>
              <span className="worklog-time">{w.startTime || '—'} 〜 {w.endTime || '（作業中）'}</span>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <WorkLogEditModal
          open={!!editing}
          workLog={editing}
          onClose={() => setEditing(null)}
          onSave={input => onUpdate(editing.id, input)}
        />
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        title="出張期間外の作業時間です"
        message="このまま登録しますか？"
        onConfirm={confirmPending}
        onCancel={() => setPendingAction(null)}
      />
    </section>
  )
}
