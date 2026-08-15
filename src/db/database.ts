import Dexie, { type Table } from 'dexie'
import type { Trip } from '@/types/trip'
import type { Todo } from '@/types/todo'
import type { WorkLog } from '@/types/workLog'
import type { Template } from '@/types/template'
import type { MachineMaster, PurposeMaster } from '@/types/master'
import type { DeleteLog } from '@/types/deleteLog'
import type { Settings } from '@/types/settings'
import type { Backup } from '@/types/backup'

/**
 * Dexie database — the single source of truth for all business data.
 * Components must never touch this class directly (Rule 1, §66):
 * Component -> Custom Hook -> Service -> Dexie -> IndexedDB.
 */
export class TripManagerDB extends Dexie {
  trips!: Table<Trip, string>
  todos!: Table<Todo, string>
  workLogs!: Table<WorkLog, string>
  templates!: Table<Template, string>
  machineMasters!: Table<MachineMaster, string>
  purposeMasters!: Table<PurposeMaster, string>
  deleteLogs!: Table<DeleteLog, string>
  settings!: Table<Settings, string>
  backups!: Table<Backup, string>

  constructor() {
    super('TripManagerDB')

    // Version 1 — initial schema. Bump the version and add upgrade() for
    // future structural changes, per implementation design §15.
    this.version(1).stores({
      trips: 'id, status, startDate, endDate',
      todos: 'id, tripId, phase, status, dueDate, order',
      workLogs: 'id, tripId, date, [tripId+date]',
      templates: 'id, machineId, purposeId',
      machineMasters: 'id, name',
      purposeMasters: 'id, name',
      deleteLogs: 'id, deletedAt, dataType',
      settings: 'id',
      backups: 'id, createdAt'
    })

    // Template due dates used to be stored as absolute date strings. They
    // cannot be reliably converted without a trip start date, so reset them
    // to "not set" and use relative day offsets from this version onward.
    this.version(2).stores({
      trips: 'id, status, startDate, endDate',
      todos: 'id, tripId, phase, status, dueDate, order',
      workLogs: 'id, tripId, date, [tripId+date]',
      templates: 'id, machineId, purposeId',
      machineMasters: 'id, name',
      purposeMasters: 'id, name',
      deleteLogs: 'id, deletedAt, dataType',
      settings: 'id',
      backups: 'id, createdAt'
    }).upgrade(tx => tx.table('templates').toCollection().modify(template => {
      template.todos = (template.todos ?? []).map((todo: { dueDate?: unknown }) => ({
        ...todo,
        dueDate: typeof todo.dueDate === 'number' ? todo.dueDate : null
      }))
    }))

    // V0.2.2 — add an explicit template name. Existing records keep a useful
    // display name derived from their former machine/purpose-based label.
    this.version(3).stores({
      trips: 'id, status, startDate, endDate',
      todos: 'id, tripId, phase, status, dueDate, order',
      workLogs: 'id, tripId, date, [tripId+date]',
      templates: 'id, templateName, machineId, purposeId',
      machineMasters: 'id, name',
      purposeMasters: 'id, name',
      deleteLogs: 'id, deletedAt, dataType',
      settings: 'id',
      backups: 'id, createdAt'
    }).upgrade(tx => tx.table('templates').toCollection().modify(template => {
      template.templateName = template.templateName || `${template.machineName} / ${template.purposeName}`
    }))
  }
}

export const db = new TripManagerDB()
