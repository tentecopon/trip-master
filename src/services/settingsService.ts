import { db } from '@/db/database'
import type { Settings } from '@/types/settings'

const SETTINGS_ID = 'default'

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get(SETTINGS_ID)
  if (existing) return existing
  const initial: Settings = { id: SETTINGS_ID, lastAutoBackupDate: null }
  await db.settings.add(initial)
  return initial
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const updated = { ...current, ...patch, id: SETTINGS_ID }
  await db.settings.put(updated)
  return updated
}
