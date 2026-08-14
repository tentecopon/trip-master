import { useMemo, useState } from 'react'
import type { Todo, TodoPhase } from '@/types/todo'
import { SortableTodoList } from './SortableTodoList'
import { TodoEditModal } from './TodoEditModal'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'

const PHASE_LABEL: Record<TodoPhase, string> = { before: '出張前ToDo', onsite: '現地ToDo', after: '出張後ToDo' }

interface Props {
  phase: TodoPhase
  todos: Todo[]
  onCreate: (input: { title: string; phase: TodoPhase; dueDate: string | null; comment: string }) => void
  onUpdate: (id: string, input: { title: string; phase: TodoPhase; dueDate: string | null; comment: string }) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Todo['status']) => void
  onReorder: (phase: TodoPhase, orderedIds: string[]) => void
}

/** One phase's Todo group: header + collapsible done items + sortable active list. §29, §35 */
export function TodoSection({ phase, todos, onCreate, onUpdate, onDelete, onStatusChange, onReorder }: Props) {
  const [modalTodo, setModalTodo] = useState<Todo | 'new' | null>(null)
  const [showDone, setShowDone] = useState(false)

  const active = useMemo(() => todos.filter(t => t.status !== 'done'), [todos])
  const done = useMemo(() => todos.filter(t => t.status === 'done'), [todos])
  const displayedActive = useMemo(() => {
    if (phase !== 'onsite') return active
    return [...active].sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31') || a.order - b.order)
  }, [active, phase])

  return (
    <section className="todo-section">
      <div className="todo-section-header">
        <h3>{PHASE_LABEL[phase]}</h3>
        <Button variant="ghost" onClick={() => setModalTodo('new')}>＋ 追加</Button>
      </div>

      {active.length === 0 && done.length === 0 && <EmptyState message="ToDoはまだありません。" />}

      {displayedActive.length > 0 && (
        <SortableTodoList
          todos={displayedActive}
          onReorder={ids => onReorder(phase, ids)}
          onStatusCycle={t => onStatusChange(t.id, t.status)}
          onEdit={t => setModalTodo(t)}
          groupByDueDate={phase === 'onsite'}
        />
      )}

      {done.length > 0 && (
        <div className="todo-done-group">
          <button type="button" className="todo-done-toggle" onClick={() => setShowDone(v => !v)}>
            完了済み（{done.length}件） {showDone ? '▲' : '▼'}
          </button>
          {showDone && (
            <ul className="todo-list todo-list-done">
              {done.map(t => (
                <li key={t.id} className="todo-item todo-status-done">
                  <button type="button" className="todo-title-btn" onClick={() => setModalTodo(t)}>
                    <span className="todo-title todo-title-done">{t.title}</span>
                  </button>
                  <button
                    type="button"
                    className="todo-status-btn todo-status-btn-done"
                    onClick={() => onStatusChange(t.id, 'todo')}
                  >
                    完了
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <TodoEditModal
        open={modalTodo !== null}
        phase={phase}
        initial={modalTodo === 'new' || modalTodo === null ? undefined : modalTodo}
        onClose={() => setModalTodo(null)}
        onSave={input => (modalTodo === 'new' ? onCreate(input) : onUpdate((modalTodo as Todo).id, input))}
        onDelete={
          modalTodo && modalTodo !== 'new'
            ? () => { onDelete((modalTodo as Todo).id); setModalTodo(null) }
            : undefined
        }
      />
    </section>
  )
}
