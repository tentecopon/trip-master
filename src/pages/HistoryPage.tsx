import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrips } from '@/hooks/useTrips'
import { formatDateJp } from '@/utils/date'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { DateInput } from '@/components/common/DateInput'

/** Completed trips, filterable by start/end date only — no advanced search. §28 */
export function HistoryPage() {
  const { trips, loading } = useTrips()
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)

  if (loading) return <Loading />

  const completed = trips
    .filter(t => t.status === 'completed')
    .filter(t => !from || t.startDate >= from)
    .filter(t => !to || t.endDate <= to)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <div className="page">
      <h1 className="page-title">履歴</h1>

      <div className="field-row">
        <DateInput label="開始日（from）" value={from} onChange={setFrom} />
        <DateInput label="終了日（to）" value={to} onChange={setTo} />
      </div>

      {completed.length === 0 && <EmptyState message="完了済みの出張はありません。" />}

      <div className="trip-card-list">
        {completed.map(t => (
          <Link key={t.id} to={`/history/${t.id}`} className="trip-card">
            <div className="trip-card-top">
              <span className="trip-card-machine">{t.machineName}</span>
            </div>
            <div className="trip-card-location">{t.location}</div>
            <div className="trip-card-dates">{formatDateJp(t.startDate)} 〜 {formatDateJp(t.endDate)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
