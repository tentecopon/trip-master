import { db } from '@/db/database'
import type { DeleteLog } from '@/types/deleteLog'
import { generateId } from '@/utils/uuid'
import { nowIso } from '@/utils/date'

export async function createDeleteLog(dataType: string, targetId: string, targetName: string): Promise<DeleteLog> {
  const log: DeleteLog = { id: generateId(), deletedAt: nowIso(), dataType, targetId, targetName }
  await db.deleteLogs.add(log)
  return log
}

export async function getDeleteLogs(): Promise<DeleteLog[]> {
  return db.deleteLogs.toArray()
}
