import type { Trip } from './trip'
import type { Todo } from './todo'
import type { WorkLog } from './workLog'
import type { Template } from './template'
import type { MachineMaster, PurposeMaster } from './master'
import type { DeleteLog } from './deleteLog'
import type { Settings } from './settings'

export const BACKUP_VERSION = '1'

export interface BackupData {
  trips: Trip[]
  todos: Todo[]
  workLogs: WorkLog[]
  templates: Template[]
  machineMasters: MachineMaster[]
  purposeMasters: PurposeMaster[]
  deleteLogs: DeleteLog[]
  settings: Settings[]
}

export interface Backup {
  id: string
  createdAt: string
  version: string
  data: BackupData
}

export type BackupKind = 'auto' | 'manual' | 'pre-restore'
