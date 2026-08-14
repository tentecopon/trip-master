import { Fragment, useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo, TodoStatus } from '@/types/todo'
import { formatDateJp, todayStr } from '@/utils/date'

interface RowProps {
  todo: Todo
  onStatusCycle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
}

const STATUS_LABEL: Record<TodoStatus, string> = { todo: '未着手', doing: '進行中', done: '完了' }

function SortableRow({ todo, onStatusCycle, onEdit }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }
  const today = todayStr()
  const overdue = todo.status !== 'done' && todo.dueDate !== null && todo.dueDate < today

  return (
    <li ref={setNodeRef} style={style} className={`todo-item todo-status-${todo.status}`}>
      <span className="todo-drag-handle" {...attributes} {...listeners} aria-label="並び替え">⠿</span>
      <button type="button" className="todo-title-btn" onClick={() => onEdit(todo)}>
        <span className={todo.status === 'done' ? 'todo-title todo-title-done' : 'todo-title'}>{todo.title}</span>
        {todo.dueDate && <span className={overdue ? 'todo-due todo-due-overdue' : 'todo-due'}>{todo.dueDate}</span>}
      </button>
      <button
        type="button"
        className={`todo-status-btn todo-status-btn-${todo.status}`}
        onClick={() => onStatusCycle(todo)}
      >
        {STATUS_LABEL[todo.status]}
      </button>
    </li>
  )
}

interface Props {
  todos: Todo[]
  onReorder: (orderedIds: string[]) => void
  onStatusCycle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  groupByDueDate?: boolean
}

const NEXT_STATUS: Record<TodoStatus, TodoStatus> = { todo: 'doing', doing: 'done', done: 'todo' }

/** dnd-kit sortable list, scoped to one phase group — each phase keeps its own independent order. §30 */
export function SortableTodoList({ todos, onReorder, onStatusCycle, onEdit, groupByDueDate = false }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [items, setItems] = useState(todos.map(t => t.id))

  if (items.length !== todos.length || !items.every((id, i) => id === todos[i]?.id)) {
    setItems(todos.map(t => t.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.indexOf(String(active.id))
    const newIndex = items.indexOf(String(over.id))
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    onReorder(newItems)
  }

  const byId = new Map(todos.map(t => [t.id, t]))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="todo-list">
          {(() => {
            let previousDueDate: string | null | undefined
            return items.map(id => {
            const todo = byId.get(id)
            if (!todo) return null
            const startsGroup = groupByDueDate && todo.dueDate !== previousDueDate
            previousDueDate = todo.dueDate
            return (
              <Fragment key={id}>
                {startsGroup && <li className="todo-date-group-label">{todo.dueDate ? formatDateJp(todo.dueDate) : '予定日未設定'}</li>}
                <SortableRow
                  todo={todo}
                  onStatusCycle={t => onStatusCycle({ ...t, status: NEXT_STATUS[t.status] })}
                  onEdit={onEdit}
                />
              </Fragment>
            )
            })
          })()}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
