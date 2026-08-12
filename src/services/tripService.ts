import { db } from '@/db/database'
import type { Trip, TripInput, TripPhase } from '@/types/trip'
import { generateId } from '@/utils/uuid'
import { nowIso, getTripPhase } from '@/utils/date'
import { createDeleteLog } from './deleteLogService'

export async function getTrips(): Promise<Trip[]> {
  return db.trips.toArray()
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  return db.trips.get(id)
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const now = nowIso()
  const trip: Trip = {
    ...input,
    id: generateId(),
    status: 'active',
    completedAt: null,
    createdAt: now,
    updatedAt: now
  }
  await db.trips.add(trip)
  return trip
}

export async function updateTrip(id: string, input: Partial<TripInput>): Promise<void> {
  await db.trips.update(id, { ...input, updatedAt: nowIso() })
}

/** Deletes a Trip and all related Todos/WorkLogs in one transaction, then logs it. §40, §56 */
export async function deleteTrip(id: string): Promise<void> {
  const trip = await db.trips.get(id)
  if (!trip) return

  await db.transaction('rw', db.trips, db.todos, db.workLogs, db.deleteLogs, async () => {
    await db.todos.where('tripId').equals(id).delete()
    await db.workLogs.where('tripId').equals(id).delete()
    await db.trips.delete(id)
    await createDeleteLog('trip', id, `${trip.machineName} / ${trip.location}`)
  })
}

export async function completeTrip(id: string): Promise<void> {
  await db.trips.update(id, { status: 'completed', completedAt: nowIso(), updatedAt: nowIso() })
}

export async function reopenTrip(id: string): Promise<void> {
  await db.trips.update(id, { status: 'active', completedAt: null, updatedAt: nowIso() })
}

/** Trip phase is never stored — always recomputed. §3, §58, Rule 3 */
export function getTripPhaseOf(trip: Trip, today?: string): TripPhase {
  return getTripPhase(trip.status, trip.startDate, trip.endDate, today)
}

/** Whether the trip currently has any incomplete Todo (used by the complete-trip confirmation, §41). */
export async function hasIncompleteTodos(tripId: string): Promise<boolean> {
  const count = await db.todos.where('tripId').equals(tripId).filter(t => t.status !== 'done').count()
  return count > 0
}
