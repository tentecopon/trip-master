import { useNavigate, useParams } from 'react-router-dom'
import type { TripInput } from '@/types/trip'
import { useTrip } from '@/hooks/useTrip'
import { useMasters } from '@/hooks/useMasters'
import { TripForm } from '@/components/trip/TripForm'
import { Loading } from '@/components/common/Loading'
import { useToast } from '@/components/common/Toast'

/** Edits the selected trip while retaining its existing ToDo and work-log data. */
export function TripEditPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { trip, loading, update } = useTrip(tripId)
  const { machines, purposes } = useMasters()
  const { show } = useToast()

  if (loading) return <Loading />
  if (!trip) return <div className="page"><p>出張が見つかりませんでした。</p></div>
  const id = trip.id

  async function handleSubmit(input: TripInput) {
    try {
      await update(input)
      show('出張予定を更新しました。')
      navigate(`/trips/${id}`)
    } catch {
      show('データを保存できませんでした。', 'error')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">出張予定を編集</h1>
      <TripForm
        machines={machines}
        purposes={purposes}
        templates={[]}
        initial={trip}
        submitLabel="保存する"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
