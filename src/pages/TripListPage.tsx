import { Link } from 'react-router-dom'
import { useTrips } from '@/hooks/useTrips'
import { getTripPhaseOf } from '@/services/tripService'
import { TripCard } from '@/components/trip/TripCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/common/Button'

/** Grouped as onsite -> before -> after, each group sorted by nearest start date. §28 */
export function TripListPage() {
  const { trips, loading } = useTrips()
  if (loading) return <Loading />

  const active = trips.filter(t => t.status === 'active')
  const byPhase = (phase: 'onsite' | 'before' | 'after') =>
    active.filter(t => getTripPhaseOf(t) === phase).sort((a, b) => a.startDate.localeCompare(b.startDate))

  const groups: { label: string; trips: typeof trips }[] = [
    { label: '出張中', trips: byPhase('onsite') },
    { label: '出張前', trips: byPhase('before') },
    { label: '出張後', trips: byPhase('after') }
  ]

  return (
    <div className="page">
      <div className="page-header-row">
        <h1 className="page-title">出張一覧</h1>
        <Link to="/trips/new"><Button variant="primary">＋ 新規登録</Button></Link>
      </div>

      {active.length === 0 && <EmptyState message="出張はまだ登録されていません。" />}

      {groups.map(g => g.trips.length > 0 && (
        <section key={g.label} className="trip-group">
          <h3>{g.label}</h3>
          <div className="trip-card-list">
            {g.trips.map(t => <TripCard key={t.id} trip={t} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
