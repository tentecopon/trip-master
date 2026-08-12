import { db } from '@/db/database'
import type { Todo, TodoInput, TodoStatus } from '@/types/todo'
import { generateId } from '@/utils/uuid'
import { nowIso, todayStr } from '@/utils/date'

export async function getTodosByTripId(tripId: string): Promise<Todo[]> {
  const todos = await db.todos.where('tripId').equals(tripId).toArray()
  return todos.sort((a, b) => a.order - b.order)
}

export async function createTodo(tripId: string, input: TodoInput): Promise<Todo> {
  const now = nowIso()
  const siblings = await db.todos.where('tripId').equals(tripId).and(t => t.phase === input.phase).toArray()
  const maxOrder = siblings.reduce((max, t) => Math.max(max, t.order), -1)
  const todo: Todo = {
    id: generateId(),
    tripId,
    title: input.title,
    phase: input.phase,
    dueDate: input.dueDate,
    comment: input.comment,
    status: 'todo',
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now
  }
  await db.todos.add(todo)
  return todo
}

export async function updateTodo(id: string, input: Partial<TodoInput>): Promise<void> {
  await db.todos.update(id, { ...input, updatedAt: nowIso() })
}

export async function deleteTodo(id: string): Promise<void> {
  await db.todos.delete(id)
}

/** todo -> doing -> done, and back again; always saved immediately. §31, §46 */
export async function changeStatus(id: string, status: TodoStatus): Promise<void> {
  await db.todos.update(id, { status, updatedAt: nowIso() })
}

/** Persists a new order within a single phase group after a drag-and-drop reorder. §30 */
export async function reorderTodos(tripId: string, phase: Todo['phase'], orderedIds: string[]): Promise<void> {
  await db.transaction('rw', db.todos, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.todos.update(orderedIds[i], { order: i, updatedAt: nowIso() })
    }
  })
}

/** onsite, not done, due today. §32 */
export async function getTodayTodos(tripId: string): Promise<Todo[]> {
  const today = todayStr()
  const todos = await getTodosByTripId(tripId)
  return todos.filter(t => t.phase === 'onsite' && t.status !== 'done' && t.dueDate === today)
}

/** onsite, not done, overdue. §33 */
export async function getOverdueTodos(tripId: string): Promise<Todo[]> {
  const today = todayStr()
  const todos = await getTodosByTripId(tripId)
  return todos.filter(t => t.phase === 'onsite' && t.status !== 'done' && t.dueDate !== null && t.dueDate < today)
}
