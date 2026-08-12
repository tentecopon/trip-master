import { useParams } from 'react-router-dom'
import { useTrip } from '@/hooks/useTrip'
import { useTodos } from '@/hooks/useTodos'
import { useWorkLogs } from '@/hooks/useWorkLogs'
import { formatDateJp } from '@/utils/date'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/common/Button'

const PHASE_LABEL = { before: '出張前', onsite: '現地', after: '出張後' } as const

/** Read-mostly view of a completed trip: info, all Todos (grouped), and full WorkLog history. */
export function HistoryDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { trip, loading, reopen } = useTrip(tripId)
  const { byPhase } = useTodos(tripId)
  const { workLogs } = useWorkLogs(tripId)

  if (loading) return <Loading />
  if (!trip) return <div className="page"><p>出張が見つかりませんでした。</p></div>

  return (
    <div className="page">
      <h1 className="page-title">{trip.machineName}</h1>
      <section className="trip-info-card">
        <dl className="trip-info-grid">
          <dt>行先</dt><dd>{trip.location}</dd>
          <dt>期間</dt><dd>{formatDateJp(trip.startDate)} 〜 {formatDateJp(trip.endDate)}</dd>
          <dt>目的</dt><dd>{trip.purposeName}</dd>
          <dt>完了日時</dt><dd>{trip.completedAt ? new Date(trip.completedAt).toLocaleString('ja-JP') : '—'}</dd>
        </dl>
      </section>

      {(['before', 'onsite', 'after'] as const).map(phase => (
        <section key={phase} className="todo-section">
          <h3>{PHASE_LABEL[phase]}ToDo</h3>
          <ul className="todo-list">
            {byPhase(phase).map(t => (
              <li key={t.id} className={`todo-item todo-status-${t.status}`}>
                <span className="todo-title">{t.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="worklog-section">
        <h3>作業時間</h3>
        <ul className="worklog-list">
          {workLogs.map(w => (
            <li key={w.id} className="worklog-item">
              <span className="worklog-date">{w.date}</span>
              <span className="worklog-time">{w.startTime} 〜 {w.endTime || '—'}</span>
            </li>
          ))}
        </ul>
      </section>

      <Button variant="secondary" fullWidth onClick={reopen}>出張を再開する</Button>
    </div>
  )
}
