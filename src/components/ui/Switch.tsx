interface Props {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ id, label, hint, checked, onChange }: Props) {
  return (
    <label className="switch" htmlFor={id}>
      <span>
        <span className="field-label" style={{ display: 'block' }}>
          {label}
        </span>
        {hint && <span className="hint">{hint}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track" aria-hidden />
    </label>
  )
}
