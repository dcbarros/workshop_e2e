import { useEffect, useId, useRef, useState } from 'react'

interface MultiSelectComboboxProps<T extends string> {
  label: string
  options: readonly T[]
  values: T[]
  onChange: (values: T[]) => void
  placeholder: string
  tooltip: string
  required?: boolean
  error?: string
  dataCy: string
}

function optionDataCy(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function MultiSelectCombobox<T extends string>({
  label,
  options,
  values,
  onChange,
  placeholder,
  tooltip,
  required = false,
  error,
  dataCy
}: MultiSelectComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const tooltipId = useId()

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function toggle(value: T) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
    } else {
      onChange([...values, value])
    }
  }

  const summary = values.length === 0 ? placeholder : values.join(', ')

  return (
    <div
      ref={rootRef}
      className={`field combo-field ${error ? 'field--error' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="field__label">
        {label} {required ? <span className="required">*</span> : null}
      </span>

      <div className="combo-field__control-wrap">
        <button
          type="button"
          className={`field__control combo-field__trigger ${values.length === 0 ? 'combo-field__trigger--placeholder' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-describedby={tooltipId}
          onClick={() => setOpen((current) => !current)}
          data-cy={dataCy}
        >
          <span className="combo-field__value">{summary}</span>
          <span className={`combo-field__chevron ${open ? 'combo-field__chevron--open' : ''}`} aria-hidden="true">⌄</span>
        </button>

        {open ? (
          <div id={listboxId} className="combo-field__menu" role="listbox" aria-multiselectable="true" data-cy={`${dataCy}-options`}>
            {options.map((option) => {
              const selected = values.includes(option)
              return (
                <label
                  key={option}
                  className={`combo-field__option ${selected ? 'combo-field__option--selected' : ''}`}
                  role="option"
                  aria-selected={selected}
                  data-cy={`${dataCy}-option-${optionDataCy(option)}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggle(option)}
                    tabIndex={-1}
                  />
                  <span>{option}</span>
                </label>
              )
            })}
          </div>
        ) : null}
      </div>

      {error ? <span className="field__message" role="alert">{error}</span> : null}

      <span
        id={tooltipId}
        role="tooltip"
        className={`field-tooltip ${showTooltip ? 'field-tooltip--visible' : ''}`}
        data-cy={`${dataCy}-tooltip`}
      >
        {tooltip}
      </span>
    </div>
  )
}
