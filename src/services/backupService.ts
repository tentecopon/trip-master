import { db } from '@/db/database'
import type { Backup, BackupData, BackupKind } from '@/types/backup'
import { BACKUP_VERSION } from '@/types/backup'
import { generateId } from '@/utils/uuid'
import { nowIso, todayStr } from '@/utils/date'
import { downloadTextFile, backupFileName } from '@/utils/file'
import { getSettings, updateSettings } from './settingsService'

const MAX_GENERATIONS = 3

async function snapshotData(): Promise<BackupData> {
  const [trips, todos, workLogs, templates, machineMasters, purposeMasters, deleteLogs, settings] =
    await Promise.all([
      db.trips.toArray(),
      db.todos.toArray(),
      db.workLogs.toArray(),
      db.templates.toArray(),
      db.machineMasters.toArray(),
      db.purposeMasters.toArray(),
      db.deleteLogs.toArray(),
      db.settings.toArray()
    ])
  // Deliberately excludes IndexedDB indexes, PWA cache, Service Worker state,
  // and any UI/React state — business data + settings only. §48
  return { trips, todos, workLogs, templates, machineMasters, purposeMasters, deleteLogs, settings }
}

async function saveBackupRecord(kind: BackupKind): Promise<Backup> {
  const backup: Backup = {
    id: generateId(),
    createdAt: nowIso(),
    version: BACKUP_VERSION,
    data: await snapshotData()
  }
  await db.backups.add(backup)
  if (kind !== 'pre-restore') await cleanupOldBackups()
  return backup
}

/** Runs once per app start; only creates a backup if today doesn't have one yet. §47 */
export async function createAutoBackupIfNeeded(): Promise<void> {
  const settings = await getSettings()
  const today = todayStr()
  if (settings.lastAutoBackupDate === today) return
  await saveBackupRecord('auto')
  await updateSettings({ lastAutoBackupDate: today })
}

export async function createBackup(kind: BackupKind = 'manual'): Promise<Backup> {
  return saveBackupRecord(kind)
}

export async function getBackups(): Promise<Backup[]> {
  const backups = await db.backups.toArray()
  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Keeps only the 3 most recent generations. §47 */
export async function cleanupOldBackups(): Promise<void> {
  const backups = await getBackups()
  const stale = backups.slice(MAX_GENERATIONS)
  if (stale.length > 0) {
    await db.backups.bulkDelete(stale.map(b => b.id))
  }
}

export async function exportBackup(): Promise<void> {
  const backup = await saveBackupRecord('manual')
  downloadTextFile(backupFileName(new Date(backup.createdAt)), JSON.stringify(backup, null, 2))
}

export interface ValidationOutcome {
  valid: boolean
  reason?: string
  data?: BackupData
}

/**
 * Rejects malformed/inconsistent backups before anything is restored. §50
 * Checked, in order: JSON parse, version, required arrays, duplicate ids,
 * invalid phase/status enums, invalid dates, and orphaned Todo/WorkLog
 * references to a non-existent Trip.
 */
export function validateBackup(raw: string): ValidationOutcome {
  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { valid: false, reason: 'JSON解析に失敗しました。' }
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.data) {
    return { valid: false, reason: '必須データが不足しています。' }
  }
  if (parsed.version !== BACKUP_VERSION) {
    return { valid: false, reason: 'backupVersionが不明です。' }
  }

  const data = parsed.data as BackupData
  const requiredArrays: (keyof BackupData)[] = [
    'trips', 'todos', 'workLogs', 'templates',
    'machineMasters', 'purposeMasters', 'deleteLogs', 'settings'
  ]
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) {
      return { valid: false, reason: `必須データが不足しています（${key}）。` }
    }
  }

  const seenIds = new Set<string>()
  const idLists = [data.trips, data.todos, data.workLogs, data.templates, data.machineMasters, data.purposeMasters]
  for (const list of idLists) {
    for (const item of list as { id: string }[]) {
      if (seenIds.has(item.id)) return { valid: false, reason: 'ID重複が検出されました。' }
      seenIds.add(item.id)
    }
  }

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  for (const t of data.trips) {
    if (!dateRe.test(t.startDate) || !dateRe.test(t.endDate)) {
      return { valid: false, reason: '不正な日付が含まれています。' }
    }
  }

  // Templates now store due dates as offsets from a trip's start date.  Old
  // backups contain absolute date strings, which cannot be converted without
  // knowing the future trip, so retain the Todo and clear only its due date.
  for (const template of data.templates) {
    if (!Array.isArray(template.todos)) {
      return { valid: false, reason: 'テンプレートのToDoが不正です。' }
    }
    for (const todo of template.todos) {
      if (typeof todo.dueDate === 'string') {
        todo.dueDate = null
      }
      if (todo.dueDate !== null && (!Number.isInteger(todo.dueDate) || todo.dueDate < 0)) {
        return { valid: false, reason: 'テンプレートの予定日設定が不正です。' }
      }
    }
  }

  const tripIds = new Set(data.trips.map(t => t.id))
  const validPhases = new Set(['before', 'onsite', 'after'])
  const validStatuses = new Set(['todo', 'doing', 'done'])
  for (const todo of data.todos) {
    if (!validPhases.has(todo.phase)) return { valid: false, reason: '不正なphaseが含まれています。' }
    if (!validStatuses.has(todo.status)) return { valid: false, reason: '不正なstatusが含まれています。' }
    if (!tripIds.has(todo.tripId)) {
      return { valid: false, reason: '存在しない出張を参照するToDoがあります。' }
    }
  }
  for (const log of data.workLogs) {
    if (!tripIds.has(log.tripId)) {
      return { valid: false, reason: '存在しない出張を参照する作業時間があります。' }
    }
  }

  return { valid: true, data }
}

/**
 * Full-replace restore, per §49/§51:
 * validate -> snapshot current data as a pre-restore backup -> wipe -> load.
 * Rolled back automatically if any step throws, because it all runs in one transaction.
 */
export async function restoreBackup(raw: string): Promise<void> {
  const outcome = validateBackup(raw)
  if (!outcome.valid || !outcome.data) {
    throw new Error(outcome.reason ?? 'データを復元できませんでした。')
  }
  const data = outcome.data

  await saveBackupRecord('pre-restore')

  await db.transaction(
    'rw',
    [
      db.trips, db.todos, db.workLogs, db.templates,
      db.machineMasters, db.purposeMasters, db.deleteLogs, db.settings
    ],
    async () => {
      await Promise.all([
        db.trips.clear(), db.todos.clear(), db.workLogs.clear(), db.templates.clear(),
        db.machineMasters.clear(), db.purposeMasters.clear(), db.deleteLogs.clear(), db.settings.clear()
      ])
      await Promise.all([
        db.trips.bulkAdd(data.trips),
        db.todos.bulkAdd(data.todos),
        db.workLogs.bulkAdd(data.workLogs),
        db.templates.bulkAdd(data.templates),
        db.machineMasters.bulkAdd(data.machineMasters),
        db.purposeMasters.bulkAdd(data.purposeMasters),
        db.deleteLogs.bulkAdd(data.deleteLogs),
        db.settings.bulkAdd(data.settings)
      ])
    }
  )
}
