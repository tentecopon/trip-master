export type TripStatus = 'active' | 'completed'

/** Trip phase is NEVER persisted — always derived from today's date. See utils/date.ts#getTripPhase */
export type TripPhase = 'before' | 'onsite' | 'after' | 'completed'

export interface Trip {
  id: string
  machineId: string | null
  machineName: string
  location: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  purposeId: string | null
  purposeName: string
  companions: string
  notes: string
  status: TripStatus
  completedAt: string | null // ISO 8601
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

/** Fields collected by TripForm; service assigns id/status/timestamps. */
export type TripInput = Omit<
  Trip,
  'id' | 'status' | 'completedAt' | 'createdAt' | 'updatedAt'
>
