import { db } from '@/db/database'
import type { MachineMaster, PurposeMaster } from '@/types/master'
import { generateId } from '@/utils/uuid'

// Deleting a master never touches existing Trips — trip records keep their
// own machineName/purposeName copy, independent of the master. §21

export async function getMachineMasters(): Promise<MachineMaster[]> {
  return db.machineMasters.toArray()
}
export async function createMachineMaster(name: string): Promise<MachineMaster> {
  const m = { id: generateId(), name }
  await db.machineMasters.add(m)
  return m
}
export async function updateMachineMaster(id: string, name: string): Promise<void> {
  await db.machineMasters.update(id, { name })
}
export async function deleteMachineMaster(id: string): Promise<void> {
  await db.machineMasters.delete(id)
}

export async function getPurposeMasters(): Promise<PurposeMaster[]> {
  return db.purposeMasters.toArray()
}
export async function createPurposeMaster(name: string): Promise<PurposeMaster> {
  const m = { id: generateId(), name }
  await db.purposeMasters.add(m)
  return m
}
export async function updatePurposeMaster(id: string, name: string): Promise<void> {
  await db.purposeMasters.update(id, { name })
}
export async function deletePurposeMaster(id: string): Promise<void> {
  await db.purposeMasters.delete(id)
}
