import { useCallback, useEffect, useState } from 'react'
import type { Trip, TripInput } from '@/types/trip'
import * as tripService from '@/services/tripService'

/** List-level Trip state: loads all trips and exposes create/delete. */
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setTrips(await tripService.getTrips())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(async (input: TripInput) => {
    const trip = await tripService.createTrip(input)
    await reload()
    return trip
  }, [reload])

  const remove = useCallback(async (id: string) => {
    await tripService.deleteTrip(id)
    await reload()
  }, [reload])

  return { trips, loading, reload, create, remove }
}
