import type { TripPhase, TripStatus } from '@/types/trip'

const PHASE_LABEL: Record<TripPhase, string> = {
  before: '出張前',
  onsite: '出張中',
  after: '出張後',
  completed: '完了'
}

export function TripPhaseBadge({ phase }: { phase: TripPhase }) {
  return <span className={`badge badge-phase-${phase}`}>{PHASE_LABEL[phase]}</span>
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`badge badge-status-${status}`}>
      {status === 'completed' ? '完了' : '進行中'}
    </span>
  )
}
