import { db } from '@/db/database'
import type { Template } from '@/types/template'
import type { Trip } from '@/types/trip'
import type { Todo } from '@/types/todo'
import { generateId } from '@/utils/uuid'
import { addDays, nowIso } from '@/utils/date'

export async function getTemplates(): Promise<Template[]> {
  return db.templates.toArray()
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  return db.templates.get(id)
}

export async function createTemplate(input: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
  const now = nowIso()
  const template: Template = { ...input, id: generateId(), createdAt: now, updatedAt: now }
  await db.templates.add(template)
  return template
}

export async function updateTemplate(
  id: string,
  input: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await db.templates.update(id, { ...input, updatedAt: nowIso() })
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id)
}

/**
 * Returns named template sets that fit this trip.  A template may leave either
 * machine or purpose blank to act as a broader reusable set.
 */
export function getSuggestedTemplates(templates: Template[], trip: Trip): Template[] {
  return templates.filter(template =>
    (template.machineId === null || template.machineId === trip.machineId) &&
    (template.purposeId === null || template.purposeId === trip.purposeId)
  )
}

/**
 * Generates fresh Todos for `tripId` from a Template's TemplateTodo list.
 * The Template and the resulting Todos are fully independent afterwards
 * (Rule 4, §20) — editing one never touches the other.
 */
export async function applyTemplate(templateId: string, tripId: string): Promise<Todo[]> {
  return db.transaction('rw', db.trips, db.todos, async () => {
    const [template, trip] = await Promise.all([db.templates.get(templateId), db.trips.get(tripId)])
    if (!template) throw new Error('テンプレートが見つかりません。')
    if (!trip) throw new Error('出張予定が見つかりません。')
    // Old backup files can predate v1.3's application-history field.
    const appliedTemplateIds = Array.isArray(trip.appliedTemplateIds) ? trip.appliedTemplateIds : []
    if (appliedTemplateIds.includes(templateId)) {
      throw new Error('このテンプレートはすでに適用済みです。')
    }

    const existing = await db.todos.where('tripId').equals(tripId).toArray()
    const nextOrderByPhase = new Map(['before', 'onsite', 'after'].map(phase => [
      phase,
      Math.max(-1, ...existing.filter(todo => todo.phase === phase).map(todo => todo.order)) + 1
    ]))
    const now = nowIso()
    const newTodos: Todo[] = template.todos.map(tt => {
      const order = nextOrderByPhase.get(tt.phase) ?? 0
      nextOrderByPhase.set(tt.phase, order + 1)
      return {
        id: generateId(),
        tripId,
        title: tt.title,
        phase: tt.phase,
        status: 'todo',
        // Template dates are offsets from the trip's start date.  A generated
        // Todo always stores a concrete YYYY-MM-DD date, independent of template.
        dueDate: tt.phase === 'onsite' && tt.dueDate !== null ? addDays(trip.startDate, tt.dueDate) : null,
        comment: '',
        order,
        createdAt: now,
        updatedAt: now
      }
    })

    await db.todos.bulkAdd(newTodos)
    await db.trips.update(tripId, {
      appliedTemplateIds: [...appliedTemplateIds, templateId],
      updatedAt: now
    })
    return newTodos
  })
}
