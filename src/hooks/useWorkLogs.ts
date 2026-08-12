import { useCallback, useEffect, useState } from 'react'
import type { WorkLog } from '@/types/workLog'
import * as workLogService from '@/services/workLogService'
import { todayStr } from '@/utils/date'

export function useWorkLogs(tripId: string | undefined) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!tripId) {
      setWorkLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setWorkLogs(await workLogService.getWorkLogs(tripId))
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    reload()
  }, [reload])

  const start = useCallback(async (date: string = todayStr()) => {
    if (!tripId) return
    setError(null)
    try {
      await workLogService.startWork(tripId, date)
      await reload()
    } catch (e) {
      setError((e as Error).message)
      throw e
    }
  }, [tripId, reload])

  const end = useCallback(async (date: string = todayStr()) => {
    if (!tripId) return
    setError(null)
    try {
      await workLogService.endWork(tripId, date)
      await reload()
    } catch (e) {
      setError((e as Error).message)
      throw e
    }
  }, [tripId, reload])

  const update = useCallback(
    async (id: string, input: Partial<Pick<WorkLog, 'date' | 'startTime' | 'endTime'>>) => {
      await workLogService.updateWorkLog(id, input)
      await reload()
    },
    [reload]
  )

  const todayLog = workLogs.find(w => w.date === todayStr())

  return { workLogs, todayLog, loading, error, reload, start, end, update }
}
