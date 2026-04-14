import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { ChevronDown, X, Check } from 'lucide-react'

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  multiple,
  clearable,
  disabled,
  id,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  const dropdownId = useMemo(() => id || `filter-dropdown-${label?.toLowerCase().replace(/\s+/g, '-') || 'default'}`, [id, label])
  const listboxId = `${dropdownId}-listbox`

  const handleClickOutside = useCallback((event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }, [])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      buttonRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClickOutside, handleKeyDown])

  const normalizedOptions = useMemo(() => {
    if (!options || options.length === 0) return []
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { label: String(opt), value: opt }
      }
      return opt
    })
  }, [options])

  const selectedValues = useMemo(() => {
    if (multiple) {
      if (Array.isArray(value)) return value
      if (value !== null && value !== undefined && value !== '') return [value]
      return []
    }
    return value !== null && value !== undefined && value !== '' ? [value] : []
  }, [value, multiple])

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder || 'Select...'
    if (multiple && selectedValues.length > 1) {
      return `${selectedValues.length} selected`
    }
    const matched = normalizedOptions.find((opt) => opt.value === selectedValues[0])
    return matched ? matched.label : String(selectedValues[0])
  }, [selectedValues, normalizedOptions, placeholder, multiple])

  const hasValue = selectedValues.length > 0

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }

  const handleSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const isSelected = currentValues.includes(optionValue)
      const nextValues = isSelected
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(nextValues)
    } else {
      onChange(optionValue)
      setIsOpen(false)
      buttonRef.current?.focus()
    }
  }

  const handleClear = (event) => {
    event.stopPropagation()
    if (multiple) {
      onChange([])
    } else {
      onChange('')
    }
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  const handleOptionKeyDown = (event, optionValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(optionValue)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col gap-1 ${className || ''}`}
    >
      {label && (
        <label
          htmlFor={dropdownId}
          className="text-xs font-medium text-surface-500 select-none"
        >
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        id={dropdownId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={label ? `${label} filter` : 'Filter dropdown'}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          inline-flex items-center justify-between gap-2
          min-w-[160px] px-3 py-2
          text-sm font-sans
          bg-white border border-surface-300 rounded-lg
          shadow-soft
          transition-all duration-150
          hover:border-brand-400 hover:shadow-card
          focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-surface-300 disabled:hover:shadow-soft
          ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-card' : ''}
          ${hasValue ? 'text-surface-900' : 'text-surface-400'}
        `}
      >
        <span className="truncate">{displayText}</span>
        <span className="flex items-center gap-1 shrink-0">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${label || 'filter'}`}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClear(e)
                }
              }}
              className="p-0.5 rounded hover:bg-surface-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-surface-400 hover:text-surface-600" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label ? `${label} options` : 'Filter options'}
          aria-multiselectable={multiple || undefined}
          className="
            absolute z-50 top-full left-0 mt-1
            w-full min-w-[160px] max-h-60
            overflow-auto
            bg-white border border-surface-200 rounded-lg
            shadow-card
            py-1
            animate-slide-down
          "
        >
          {normalizedOptions.length === 0 && (
            <li className="px-3 py-2 text-sm text-surface-400 select-none">
              No options available
            </li>
          )}
          {normalizedOptions.map((option) => {
            const isSelected = selectedValues.includes(option.value)
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                className={`
                  flex items-center gap-2
                  px-3 py-2 text-sm cursor-pointer select-none
                  transition-colors duration-100
                  ${isSelected
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-surface-700 hover:bg-surface-50'
                  }
                  focus:outline-none focus:bg-surface-100
                `}
              >
                {multiple && (
                  <span
                    className={`
                      flex items-center justify-center w-4 h-4 rounded border shrink-0
                      transition-colors duration-100
                      ${isSelected
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-surface-300 bg-white'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
                {!multiple && isSelected && (
                  <Check className="w-4 h-4 text-brand-600 ml-auto shrink-0" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

FilterDropdown.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }),
    ])
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  multiple: PropTypes.bool,
  clearable: PropTypes.bool,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  className: PropTypes.string,
}

FilterDropdown.defaultProps = {
  label: '',
  value: '',
  placeholder: 'Select...',
  multiple: false,
  clearable: true,
  disabled: false,
  id: '',
  className: '',
}

export default FilterDropdown