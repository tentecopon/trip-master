export type TodoPhase = 'before' | 'onsite' | 'after'
export type TodoStatus = 'todo' | 'doing' | 'done'

export interface Todo {
  id: string
  tripId: string
  title: string
  phase: TodoPhase
  status: TodoStatus
  dueDate: string | null // YYYY-MM-DD
  comment: string
  order: number
  createdAt: string
  updatedAt: string
}

export type TodoInput = Pick<Todo, 'title' | 'phase' | 'dueDate' | 'comment'>
