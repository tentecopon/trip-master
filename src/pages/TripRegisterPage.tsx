import { useNavigate } from 'react-router-dom'
import type { TripInput } from '@/types/trip'
import { useTrips } from '@/hooks/useTrips'
import { useMasters } from '@/hooks/useMasters'
import { useTemplates } from '@/hooks/useTemplates'
import { TripForm } from '@/components/trip/TripForm'
import { useToast } from '@/components/common/Toast'

export function TripRegisterPage() {
  const navigate = useNavigate()
  const { create } = useTrips()
  const { machines, purposes } = useMasters()
  const { templates, applyToTrip } = useTemplates()
  const { show } = useToast()

  async function handleSubmit(input: TripInput, templateId: string | null) {
    try {
      const trip = await create(input)
      if (templateId) await applyToTrip(templateId, trip.id)
      navigate(`/trips/${trip.id}`)
    } catch {
      show('データを保存できませんでした。', 'error')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">出張登録</h1>
      <TripForm machines={machines} purposes={purposes} templates={templates} submitLabel="登録する" onSubmit={handleSubmit} />
    </div>
  )
}
