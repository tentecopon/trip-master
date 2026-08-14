import type { TodoPhase } from './todo'

export interface TemplateTodo {
  title: string
  phase: TodoPhase
  /** Days from the trip start date. null means that no due date is assigned. */
  dueDate: number | null
  order: number
}

export interface Template {
  id: string
  machineId: string | null
  machineName: string
  purposeId: string | null
  purposeName: string
  todos: TemplateTodo[]
  createdAt: string
  updatedAt: string
}
