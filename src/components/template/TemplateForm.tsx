import { useEffect, useState } from 'react'
import type { Template, TemplateTodo } from '@/types/template'
import type { TodoPhase } from '@/types/todo'
import type { MachineMaster, PurposeMaster } from '@/types/master'
import { Button } from '@/components/common/Button'
import { DateInput } from '@/components/common/DateInput'

interface Props {
  machines: MachineMaster[]
  purposes: PurposeMaster[]
  initial?: Template
  onSave: (input: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>
}

const PHASE_LABEL: Record<TodoPhase, string> = { before: '出張前', onsite: '現地', after: '出張後' }

/** Template editor: machine/purpose header plus an editable TemplateTodo list. §29, §45 */
export function TemplateForm({ machines, purposes, initial, onSave }: Props) {
  const [machineId, setMachineId] = useState(initial?.machineId ?? '')
  const [machineName, setMachineName] = useState(initial?.machineName ?? '')
  const [purposeId, setPurposeId] = useState(initial?.purposeId ?? '')
  const [purposeName, setPurposeName] = useState(initial?.purposeName ?? '')
  const [todos, setTodos] = useState<TemplateTodo[]>(initial?.todos ?? [])
  const [error, setError] = useState<string | null>(null)

  // React Router reuses this form when the edit target changes.  Keep its
  // controlled fields in sync with the template that was actually selected.
  useEffect(() => {
    setMachineId(initial?.machineId ?? '')
    setMachineName(initial?.machineName ?? '')
    setPurposeId(initial?.purposeId ?? '')
    setPurposeName(initial?.purposeName ?? '')
    setTodos(initial?.todos.map(todo => ({ ...todo })) ?? [])
    setError(null)
  }, [initial?.id])

  function addRow() {
    setTodos(prev => [...prev, { title: '', phase: 'before', dueDate: null, order: prev.length }])
  }
  function updateRow(index: number, patch: Partial<TemplateTodo>) {
    setTodos(prev => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  }
  function removeRow(index: number) {
    setTodos(prev => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, order: i })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!machineName.trim() || !purposeName.trim()) {
      setError('装置・目的は必須です。')
      return
    }
    if (todos.some(t => !t.title.trim())) {
      setError('すべてのToDoにタイトルを入力してください。')
      return
    }
    setError(null)
    await onSave({ machineId: machineId || null, machineName, purposeId: purposeId || null, purposeName, todos })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <label className="field">
        <span className="field-label">装置<span className="required">*</span></span>
        <select className="field-input" value={machineId} onChange={e => {
          setMachineId(e.target.value)
          const f = machines.find(m => m.id === e.target.value)
          if (f) setMachineName(f.name)
        }}>
          <option value="">選択しない（自由入力）</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input className="field-input" placeholder="装置名" value={machineName} onChange={e => setMachineName(e.target.value)} />
      </label>

      <label className="field">
        <span className="field-label">目的<span className="required">*</span></span>
        <select className="field-input" value={purposeId} onChange={e => {
          setPurposeId(e.target.value)
          const f = purposes.find(p => p.id === e.target.value)
          if (f) setPurposeName(f.name)
        }}>
          <option value="">選択しない（自由入力）</option>
          {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="field-input" placeholder="目的" value={purposeName} onChange={e => setPurposeName(e.target.value)} />
      </label>

      <div className="field-label">ToDo一覧</div>
      <ul className="template-todo-list">
        {todos.map((t, i) => (
          <li key={i} className="template-todo-row">
            <select className="field-input" value={t.phase} onChange={e => updateRow(i, { phase: e.target.value as TodoPhase })}>
              {(Object.keys(PHASE_LABEL) as TodoPhase[]).map(p => <option key={p} value={p}>{PHASE_LABEL[p]}</option>)}
            </select>
            <input
              className="field-input"
              placeholder="タイトル"
              value={t.title}
              onChange={e => updateRow(i, { title: e.target.value })}
            />
            <DateInput value={t.dueDate} onChange={v => updateRow(i, { dueDate: v })} />
            <Button type="button" variant="danger" onClick={() => removeRow(i)}>削除</Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="ghost" onClick={addRow}>＋ ToDoを追加</Button>

      <Button type="submit" variant="primary" fullWidth>保存</Button>
    </form>
  )
}
