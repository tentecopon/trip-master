import { useCallback, useEffect, useState } from 'react'
import type { Trip, TripInput } from '@/types/trip'
import * as tripService from '@/services/tripService'

/** Single-Trip detail state: load / update / complete / reopen / delete. */
export function useTrip(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!tripId) {
      setTrip(undefined)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setTrip(await tripService.getTrip(tripId))
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    reload()
  }, [reload])

  const update = useCallback(async (input: Partial<TripInput>) => {
    if (!tripId) return
    await tripService.updateTrip(tripId, input)
    await reload()
  }, [tripId, reload])

  const complete = useCallback(async () => {
    if (!tripId) return
    await tripService.completeTrip(tripId)
    await reload()
  }, [tripId, reload])

  const reopen = useCallback(async () => {
    if (!tripId) return
    await tripService.reopenTrip(tripId)
    await reload()
  }, [tripId, reload])

  const remove = useCallback(async () => {
    if (!tripId) return
    await tripService.deleteTrip(tripId)
  }, [tripId])

  const checkIncompleteTodos = useCallback(async () => {
    if (!tripId) return false
    return tripService.hasIncompleteTodos(tripId)
  }, [tripId])

  return { trip, loading, reload, update, complete, reopen, remove, checkIncompleteTodos }
}
