import { useNavigate } from 'react-router-dom'
import type { TripInput } from '@/types/trip'
import { useTrips } from '@/hooks/useTrips'
import { useMasters } from '@/hooks/useMasters'
import { useTemplates } from '@/hooks/useTemplates'
import { TripForm } from '@/components/trip/TripForm'
import { useToast } from '@/components/common/Toast'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import type { Trip } from '@/types/trip'
import type { Template } from '@/types/template'
import { useState } from 'react'

export function TripRegisterPage() {
  const navigate = useNavigate()
  const { create } = useTrips()
  const { machines, purposes } = useMasters()
  const { applyToTrip, suggestedForTrip } = useTemplates()
  const { show } = useToast()
  const [createdTrip, setCreatedTrip] = useState<Trip | null>(null)
  const [candidates, setCandidates] = useState<Template[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [applying, setApplying] = useState(false)

  async function handleSubmit(input: TripInput) {
    try {
      const trip = await create(input)
      const suggested = suggestedForTrip(trip)
      if (suggested.length === 0) {
        navigate(`/trips/${trip.id}`)
        return
      }
      setCreatedTrip(trip)
      setCandidates(suggested)
      setSelectedIds(suggested.map(template => template.id))
    } catch {
      show('データを保存できませんでした。', 'error')
    }
  }

  function closeSuggestions() {
    if (createdTrip) navigate(`/trips/${createdTrip.id}`)
  }

  async function applySelected() {
    if (!createdTrip) return
    setApplying(true)
    try {
      for (const templateId of selectedIds) await applyToTrip(templateId, createdTrip.id)
      closeSuggestions()
    } catch (error) {
      show(error instanceof Error ? error.message : 'テンプレートを適用できませんでした。', 'error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">出張登録</h1>
      <TripForm machines={machines} purposes={purposes} submitLabel="登録する" onSubmit={handleSubmit} />
      <Modal
        open={createdTrip !== null}
        title="テンプレートを適用しますか？"
        onClose={closeSuggestions}
        footer={
          <div className="confirm-actions">
            <Button variant="ghost" onClick={closeSuggestions} disabled={applying}>適用しない</Button>
            <Button variant="primary" onClick={applySelected} disabled={applying || selectedIds.length === 0}>
              {applying ? '適用中…' : '選択したセットを適用'}
            </Button>
          </div>
        }
      >
        <p className="confirm-message">この出張に合うテンプレートセットです。適用するセットを選んでください。</p>
        <div className="template-suggestion-list">
          {candidates.map(template => (
            <label key={template.id} className="template-suggestion">
              <input
                type="checkbox"
                checked={selectedIds.includes(template.id)}
                onChange={event => setSelectedIds(ids => event.target.checked ? [...ids, template.id] : ids.filter(id => id !== template.id))}
              />
              <span><strong>{template.templateName}</strong><small>{template.todos.length}件のToDo</small></span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}
