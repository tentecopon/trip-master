import type { TodoPhase } from './todo'

export interface TemplateTodo {
  title: string
  phase: TodoPhase
  dueDate: string | null
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
