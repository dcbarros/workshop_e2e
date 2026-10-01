interface SelectFieldProps<T extends string> {
  label: string
  options: readonly T[]
  value: T | ''
  onChange: (value: T) => void
  placeholder: string
  tooltip?: string
  required?: boolean
  error?: string
  dataCy: string
}

export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  dataCy
}: SelectFieldProps<T>) {
  return (
    <label
      className={`field ${error ? 'field--error' : ''}`}
    >
      <span className="field__label">
        {label}
        {required ? <span className="required"> *</span> : null}
      </span>

      <select
        className="field__control"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value as T)}
        data-cy={dataCy}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      {error ? (
        <span
          className="field__message"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  )
}