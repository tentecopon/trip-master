import { db } from '@/db/database'
import type { MachineMaster, PurposeMaster } from '@/types/master'
import { generateId } from '@/utils/uuid'

// Deleting a master never touches existing Trips — trip records keep their
// own machineName/purposeName copy, independent of the master. §21

function normalizedName(name: string): string {
  return name.trim()
}

async function assertUniqueName<T extends { id: string; name: string }>(
  masters: import('dexie').Table<T, string>,
  name: string,
  excludeId?: string
): Promise<string> {
  const normalized = normalizedName(name)
  if (!normalized) throw new Error('名称を入力してください。')
  const duplicate = await masters.filter(master => master.id !== excludeId && master.name === normalized).first()
  if (duplicate) throw new Error('同じ名称は登録できません。')
  return normalized
}

export async function getMachineMasters(): Promise<MachineMaster[]> {
  return db.machineMasters.toArray()
}
export async function createMachineMaster(name: string): Promise<MachineMaster> {
  const m = { id: generateId(), name: await assertUniqueName(db.machineMasters, name) }
  await db.machineMasters.add(m)
  return m
}
export async function updateMachineMaster(id: string, name: string): Promise<void> {
  await db.machineMasters.update(id, { name: await assertUniqueName(db.machineMasters, name, id) })
}
export async function deleteMachineMaster(id: string): Promise<void> {
  await db.machineMasters.delete(id)
}

export async function getPurposeMasters(): Promise<PurposeMaster[]> {
  return db.purposeMasters.toArray()
}
export async function createPurposeMaster(name: string): Promise<PurposeMaster> {
  const m = { id: generateId(), name: await assertUniqueName(db.purposeMasters, name) }
  await db.purposeMasters.add(m)
  return m
}
export async function updatePurposeMaster(id: string, name: string): Promise<void> {
  await db.purposeMasters.update(id, { name: await assertUniqueName(db.purposeMasters, name, id) })
}
export async function deletePurposeMaster(id: string): Promise<void> {
  await db.purposeMasters.delete(id)
}
