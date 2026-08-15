import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Trip } from '@/types/trip'
import type { Todo } from '@/types/todo'
import * as tripService from '@/services/tripService'
import * as todoService from '@/services/todoService'
import { getTripPhaseOf } from '@/services/tripService'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { TripPhaseBadge } from '@/components/trip/TripBadges'

interface TripTodos {
  trip: Trip
  today: Todo[]
  overdue: Todo[]
  workingNow: boolean
}

/** App landing screen: current trip(s), today's ToDo, overdue ToDo, work status. §28 */
export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<TripTodos[]>([])

  useEffect(() => {
    (async () => {
      const trips = await tripService.getTrips()
      const active = trips.filter(t => t.status === 'active')
      const data = await Promise.all(
        active.map(async trip => ({
          trip,
          today: await todoService.getTodayTodos(trip.id),
          overdue: await todoService.getOverdueTodos(trip.id)
        }))
      )
      setRows(data.map(d => ({ ...d, workingNow: false })))
      setLoading(false)
    })()
  }, [])

  if (loading) return <Loading />

  const onsite = rows.filter(r => getTripPhaseOf(r.trip) === 'onsite')
  const others = rows.filter(r => getTripPhaseOf(r.trip) !== 'onsite')

  return (
    <div className="page">
      <h1 className="page-title">ホーム</h1>

      {rows.length === 0 && <EmptyState message="現在進行中の出張はありません。" />}

      {onsite.map(r => (
        <Link key={r.trip.id} to={`/trips/${r.trip.id}`} className="dashboard-trip-block dashboard-trip-link">
          <div className="dashboard-trip-header">
            <span>{r.trip.machineName} / {r.trip.location}</span>
            <TripPhaseBadge phase="onsite" />
          </div>

          <div className="dashboard-sub">
            <h4>今日のToDo</h4>
            {r.today.length === 0 ? (
              <EmptyState message="今日のToDoはありません。" />
            ) : (
              <ul className="todo-list">
                {r.today.map(t => <li key={t.id} className="todo-item"><span className="todo-title">{t.title}</span></li>)}
              </ul>
            )}
          </div>

          {r.overdue.length > 0 && (
            <div className="dashboard-sub">
              <h4>持ち越しToDo</h4>
              <ul className="todo-list">
                {r.overdue.map(t => (
                  <li key={t.id} className="todo-item todo-item-overdue">
                    <span className="todo-title">{t.title}</span>
                    <span className="todo-due todo-due-overdue">{t.dueDate}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Link>
      ))}

      {others.length > 0 && (
        <section className="dashboard-trip-block">
          <h4>その他の出張中案件</h4>
          <ul className="trip-mini-list">
            {others.map(r => (
              <li key={r.trip.id}>
                <Link to={`/trips/${r.trip.id}`}>{r.trip.machineName} / {r.trip.location}</Link>
                <TripPhaseBadge phase={getTripPhaseOf(r.trip)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
