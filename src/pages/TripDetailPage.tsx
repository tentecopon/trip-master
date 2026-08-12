import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrip } from '@/hooks/useTrip'
import { useTodos } from '@/hooks/useTodos'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { getTripPhaseOf } from '@/services/tripService'
import { formatDateJp } from '@/utils/date'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/Toast'
import { TripPhaseBadge, TripStatusBadge } from '@/components/trip/TripBadges'
import { TodoSection } from '@/components/todo/TodoSection'
import { WorkLogSection } from '@/components/worklog/WorkLogSection'

/**
 * Single-screen Trip workspace: info -> WorkLog -> before/onsite/after ToDo -> complete.
 * No navigation away is required to operate Todos or WorkLog. §28
 */
export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { show } = useToast()

  const { trip, loading, complete, reopen, remove, checkIncompleteTodos } = useTrip(tripId)
  const todosApi = useTodos(tripId)
  const workLogsApi = useWorkLogs(tripId)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  if (loading) return <Loading />
  if (!trip) return <div className="page"><p>出張が見つかりませんでした。</p></div>

  const phase = getTripPhaseOf(trip)

  async function handleCompleteClick() {
    const hasIncomplete = await checkIncompleteTodos()
    if (hasIncomplete) {
      setConfirmComplete(true)
    } else {
      await complete()
      show('出張を完了しました。')
    }
  }

  async function handleDelete() {
    try {
      await remove()
      show('出張を削除しました。')
      navigate('/trips')
    } catch {
      show('データを保存できませんでした。', 'error')
    }
  }

  return (
    <div className="page">
      <div className="trip-detail-header">
        <div>
          <h1 className="page-title">{trip.machineName}</h1>
          <div className="trip-detail-badges">
            <TripPhaseBadge phase={phase} />
            <TripStatusBadge status={trip.status} />
          </div>
        </div>
      </div>

      <section className="trip-info-card">
        <dl className="trip-info-grid">
          <dt>行先</dt><dd>{trip.location}</dd>
          <dt>期間</dt><dd>{formatDateJp(trip.startDate)} 〜 {formatDateJp(trip.endDate)}</dd>
          <dt>目的</dt><dd>{trip.purposeName}</dd>
          {trip.companions && <><dt>同行者</dt><dd>{trip.companions}</dd></>}
          {trip.notes && <><dt>メモ</dt><dd>{trip.notes}</dd></>}
        </dl>
      </section>

      <WorkLogSection
        trip={trip}
        workLogs={workLogsApi.workLogs}
        todayLog={workLogsApi.todayLog}
        onStart={workLogsApi.start}
        onEnd={workLogsApi.end}
        onUpdate={workLogsApi.update}
      />

      <TodoSection
        phase="before"
        todos={todosApi.byPhase('before')}
        onCreate={todosApi.create}
        onUpdate={todosApi.update}
        onDelete={todosApi.remove}
        onStatusChange={todosApi.changeStatus}
        onReorder={todosApi.reorder}
      />
      <TodoSection
        phase="onsite"
        todos={todosApi.byPhase('onsite')}
        onCreate={todosApi.create}
        onUpdate={todosApi.update}
        onDelete={todosApi.remove}
        onStatusChange={todosApi.changeStatus}
        onReorder={todosApi.reorder}
      />
      <TodoSection
        phase="after"
        todos={todosApi.byPhase('after')}
        onCreate={todosApi.create}
        onUpdate={todosApi.update}
        onDelete={todosApi.remove}
        onStatusChange={todosApi.changeStatus}
        onReorder={todosApi.reorder}
      />

      <section className="trip-detail-actions">
        {trip.status === 'active' ? (
          <Button variant="primary" fullWidth onClick={handleCompleteClick}>出張を完了する</Button>
        ) : (
          <Button variant="secondary" fullWidth onClick={reopen}>出張を再開する</Button>
        )}
        <Button variant="danger" fullWidth onClick={() => setConfirmDelete(true)}>出張を削除する</Button>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="この出張を削除しますか？"
        message="出張に関連するToDo・作業時間も削除されます。"
        confirmLabel="削除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={confirmComplete}
        title="未完了のToDoがあります"
        message="それでも出張を完了しますか？"
        confirmLabel="完了する"
        onConfirm={async () => { await complete(); setConfirmComplete(false); show('出張を完了しました。') }}
        onCancel={() => setConfirmComplete(false)}
      />
    </div>
  )
}
