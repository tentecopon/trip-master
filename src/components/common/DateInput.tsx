interface Props {
  label?: string
  value: string | null
  onChange: (value: string | null) => void
  required?: boolean
}

export function DateInput({ label, value, onChange, required }: Props) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}{required && <span className="required">*</span>}</span>}
      <input
        type="date"
        className="field-input"
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
      />
    </label>
  )
}
