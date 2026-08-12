import { useCallback, useEffect, useState } from 'react'
import type { Todo, TodoInput, TodoPhase, TodoStatus } from '@/types/todo'
import * as todoService from '@/services/todoService'

export function useTodos(tripId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!tripId) {
      setTodos([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setTodos(await todoService.getTodosByTripId(tripId))
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(async (input: TodoInput) => {
    if (!tripId) return
    await todoService.createTodo(tripId, input)
    await reload()
  }, [tripId, reload])

  const update = useCallback(async (id: string, input: Partial<TodoInput>) => {
    await todoService.updateTodo(id, input)
    await reload()
  }, [reload])

  const remove = useCallback(async (id: string) => {
    await todoService.deleteTodo(id)
    await reload()
  }, [reload])

  const changeStatus = useCallback(async (id: string, status: TodoStatus) => {
    await todoService.changeStatus(id, status)
    await reload()
  }, [reload])

  const reorder = useCallback(async (phase: TodoPhase, orderedIds: string[]) => {
    if (!tripId) return
    await todoService.reorderTodos(tripId, phase, orderedIds)
    await reload()
  }, [tripId, reload])

  const byPhase = (phase: TodoPhase) => todos.filter(t => t.phase === phase).sort((a, b) => a.order - b.order)

  return { todos, byPhase, loading, reload, create, update, remove, changeStatus, reorder }
}
