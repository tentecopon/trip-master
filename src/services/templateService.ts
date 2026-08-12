import { db } from '@/db/database'
import type { Template } from '@/types/template'
import type { Todo } from '@/types/todo'
import { generateId } from '@/utils/uuid'
import { nowIso } from '@/utils/date'

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
 * Generates fresh Todos for `tripId` from a Template's TemplateTodo list.
 * The Template and the resulting Todos are fully independent afterwards
 * (Rule 4, §20) — editing one never touches the other.
 */
export async function applyTemplate(templateId: string, tripId: string): Promise<Todo[]> {
  const template = await db.templates.get(templateId)
  if (!template) throw new Error('テンプレートが見つかりません。')

  const now = nowIso()
  const newTodos: Todo[] = template.todos.map(tt => ({
    id: generateId(),
    tripId,
    title: tt.title,
    phase: tt.phase,
    status: 'todo',
    dueDate: tt.dueDate,
    comment: '',
    order: tt.order,
    createdAt: now,
    updatedAt: now
  }))

  await db.todos.bulkAdd(newTodos)
  return newTodos
}
