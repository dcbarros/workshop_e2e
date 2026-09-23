import type { InputHTMLAttributes, ReactNode } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  warning?: string
  hint?: string
  after?: ReactNode
}

export function Field({ label, error, warning, hint, after, className = '', ...props }: FieldProps) {
  const stateClass = error ? 'field--error' : warning ? 'field--warning' : ''
  return (
    <label className={`field ${stateClass} ${className}`.trim()}>
      <span className="field__label">{label}{props.required ? <span className="required"> *</span> : null}</span>
      <span className="field__control-wrap">
        <input className="field__control" {...props} />
        {after}
      </span>
      {error ? <span className="field__message" role="alert">{error}</span> : null}
      {!error && warning ? <span className="field__message">{warning}</span> : null}
      {!error && !warning && hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}
