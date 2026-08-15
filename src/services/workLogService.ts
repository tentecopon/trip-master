import { db } from '@/db/database'
import type { WorkLog } from '@/types/workLog'
import { generateId } from '@/utils/uuid'
import { nowIso, nowTimeStr, todayStr } from '@/utils/date'

export async function getWorkLogs(tripId: string): Promise<WorkLog[]> {
  const logs = await db.workLogs.where('tripId').equals(tripId).toArray()
  return logs.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getWorkLog(tripId: string, date: string): Promise<WorkLog | undefined> {
  return db.workLogs.where('[tripId+date]').equals([tripId, date]).first()
}

/**
 * Beta scope: exactly one WorkLog per Trip per day (one work interval). §7, §36
 * Throws if that day already has a started (or completed) entry.
 */
export async function startWork(tripId: string, date: string = todayStr()): Promise<WorkLog> {
  const existing = await getWorkLog(tripId, date)
  if (existing) {
    throw new Error('この日の作業は既に開始されています。')
  }
  const log: WorkLog = {
    id: generateId(),
    tripId,
    date,
    startTime: nowTimeStr(),
    endTime: '',
    updatedAt: nowIso()
  }
  await db.workLogs.add(log)
  return log
}

/** §37 — requires a started entry; does not auto-split across midnight (§39). */
export async function endWork(tripId: string, date: string = todayStr()): Promise<WorkLog> {
  const existing = await getWorkLog(tripId, date)
  if (!existing || !existing.startTime) {
    throw new Error('作業開始が記録されていません。')
  }
  const updated = { ...existing, endTime: nowTimeStr(), updatedAt: nowIso() }
  await db.workLogs.put(updated)
  return updated
}

export async function updateWorkLog(
  id: string,
  input: Partial<Pick<WorkLog, 'date' | 'startTime' | 'endTime'>>
): Promise<void> {
  const current = await db.workLogs.get(id)
  if (!current) throw new Error('作業時間が見つかりません。')

  const date = input.date ?? current.date
  if (date !== current.date) {
    const duplicate = await getWorkLog(current.tripId, date)
    if (duplicate) throw new Error('この日の作業時間は既に登録されています。')
  }
  await db.workLogs.update(id, { ...input, updatedAt: nowIso() })
}

export async function deleteWorkLog(id: string): Promise<void> {
  await db.workLogs.delete(id)
}

/** §38 — true when `date` falls outside [startDate, endDate], used to trigger the warning dialog. */
export function isOutsideTripPeriod(date: string, startDate: string, endDate: string): boolean {
  return date < startDate || date > endDate
}
