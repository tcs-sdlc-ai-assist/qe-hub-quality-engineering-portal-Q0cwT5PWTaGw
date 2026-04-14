import { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { RotateCcw } from 'lucide-react'

function FilterDropdown({ label, name, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={`filter-${name}`}
          className="text-xs font-medium text-surface-500"
        >
          {label}
        </label>
      )}
      <select
        id={`filter-${name}`}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 shadow-soft transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-surface-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

FilterDropdown.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

function buildInitialState(filters) {
  const state = {}
  for (const filter of filters) {
    state[filter.name] = filter.defaultValue || ''
  }
  return state
}

export default function FilterBar({ filters, onChange, className }) {
  const initialState = useMemo(() => buildInitialState(filters), [filters])
  const [filterValues, setFilterValues] = useState(initialState)

  const handleFilterChange = useCallback(
    (name, value) => {
      setFilterValues((prev) => {
        const next = { ...prev, [name]: value }
        if (onChange) {
          onChange(next)
        }
        return next
      })
    },
    [onChange]
  )

  const handleReset = useCallback(() => {
    const resetState = buildInitialState(filters)
    setFilterValues(resetState)
    if (onChange) {
      onChange(resetState)
    }
  }, [filters, onChange])

  const hasActiveFilters = useMemo(() => {
    return filters.some((filter) => {
      const currentValue = filterValues[filter.name]
      const defaultValue = filter.defaultValue || ''
      return currentValue !== defaultValue
    })
  }, [filters, filterValues])

  return (
    <div
      className={`flex flex-wrap items-end gap-4 rounded-xl border border-surface-200 bg-white p-4 shadow-card ${className || ''}`}
    >
      {filters.map((filter) => (
        <FilterDropdown
          key={filter.name}
          label={filter.label}
          name={filter.name}
          options={filter.options}
          value={filterValues[filter.name] || ''}
          onChange={handleFilterChange}
        />
      ))}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm font-medium text-surface-600 shadow-soft transition-colors hover:bg-surface-100 hover:text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  )
}

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      defaultValue: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
}