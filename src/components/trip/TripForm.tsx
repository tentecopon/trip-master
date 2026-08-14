import { useEffect, useState } from 'react'
import type { TripInput } from '@/types/trip'
import type { MachineMaster, PurposeMaster } from '@/types/master'
import type { Template } from '@/types/template'
import { Button } from '@/components/common/Button'
import { DateInput } from '@/components/common/DateInput'

interface Props {
  machines: MachineMaster[]
  purposes: PurposeMaster[]
  templates: Template[]
  initial?: Partial<TripInput>
  submitLabel: string
  onSubmit: (input: TripInput, templateId: string | null) => void | Promise<void>
}

/** Trip registration/edit form. Required: machine, location, dates, purpose. §29, §45 */
export function TripForm({ machines, purposes, templates, initial, submitLabel, onSubmit }: Props) {
  const [machineId, setMachineId] = useState(initial?.machineId ?? '')
  const [machineName, setMachineName] = useState(initial?.machineName ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [purposeId, setPurposeId] = useState(initial?.purposeId ?? '')
  const [purposeName, setPurposeName] = useState(initial?.purposeName ?? '')
  const [companions, setCompanions] = useState(initial?.companions ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [templateId, setTemplateId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Supports both registration and edit screens without retaining values from
  // the previously selected trip.
  useEffect(() => {
    setMachineId(initial?.machineId ?? '')
    setMachineName(initial?.machineName ?? '')
    setLocation(initial?.location ?? '')
    setStartDate(initial?.startDate ?? '')
    setEndDate(initial?.endDate ?? '')
    setPurposeId(initial?.purposeId ?? '')
    setPurposeName(initial?.purposeName ?? '')
    setCompanions(initial?.companions ?? '')
    setNotes(initial?.notes ?? '')
    setTemplateId('')
    setError(null)
  }, [initial?.startDate, initial?.endDate, initial?.machineId, initial?.machineName, initial?.location, initial?.purposeId, initial?.purposeName, initial?.companions, initial?.notes])

  function handleMachinePick(id: string) {
    setMachineId(id)
    const found = machines.find(m => m.id === id)
    if (found) setMachineName(found.name)
  }

  function handlePurposePick(id: string) {
    setPurposeId(id)
    const found = purposes.find(p => p.id === id)
    if (found) setPurposeName(found.name)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!machineName.trim() || !location.trim() || !startDate || !endDate || !purposeName.trim()) {
      setError('装置名・行先・開始日・終了日・目的は必須です。')
      return
    }
    if (startDate > endDate) {
      setError('開始日は終了日より前の日付にしてください。')
      return
    }
    setError(null)
    await onSubmit(
      {
        machineId: machineId || null,
        machineName,
        location,
        startDate,
        endDate,
        purposeId: purposeId || null,
        purposeName,
        companions,
        notes
      },
      templateId || null
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <label className="field">
        <span className="field-label">装置<span className="required">*</span></span>
        <select className="field-input" value={machineId} onChange={e => handleMachinePick(e.target.value)}>
          <option value="">選択しない（自由入力）</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input
          className="field-input"
          placeholder="装置名を入力"
          value={machineName}
          onChange={e => setMachineName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">行先<span className="required">*</span></span>
        <input className="field-input" value={location} onChange={e => setLocation(e.target.value)} />
      </label>

      <div className="field-row">
        <DateInput label="開始日" value={startDate || null} onChange={v => setStartDate(v ?? '')} required />
        <DateInput label="終了日" value={endDate || null} onChange={v => setEndDate(v ?? '')} required />
      </div>

      <label className="field">
        <span className="field-label">目的<span className="required">*</span></span>
        <select className="field-input" value={purposeId} onChange={e => handlePurposePick(e.target.value)}>
          <option value="">選択しない（自由入力）</option>
          {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input
          className="field-input"
          placeholder="目的を入力"
          value={purposeName}
          onChange={e => setPurposeName(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">同行者</span>
        <input className="field-input" value={companions} onChange={e => setCompanions(e.target.value)} />
      </label>

      <label className="field">
        <span className="field-label">メモ</span>
        <textarea className="field-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
      </label>

      {templates.length > 0 && (
        <label className="field">
          <span className="field-label">テンプレート</span>
          <select className="field-input" value={templateId} onChange={e => setTemplateId(e.target.value)}>
            <option value="">使用しない</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.machineName} / {t.purposeName}</option>
            ))}
          </select>
        </label>
      )}

      <Button type="submit" variant="primary" fullWidth>{submitLabel}</Button>
    </form>
  )
}
