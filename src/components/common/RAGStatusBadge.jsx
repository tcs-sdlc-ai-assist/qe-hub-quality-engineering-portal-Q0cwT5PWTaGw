import { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ChevronDown, Info } from 'lucide-react'

const RAG_STATUSES = {
  RED: {
    label: 'Red',
    description: 'Critical issues — immediate action required',
    bgColor: 'bg-danger-100',
    textColor: 'text-danger-700',
    dotColor: 'bg-danger-500',
    borderColor: 'border-danger-300',
    hoverBg: 'hover:bg-danger-50',
  },
  AMBER: {
    label: 'Amber',
    description: 'At risk — monitoring and mitigation needed',
    bgColor: 'bg-warning-100',
    textColor: 'text-warning-700',
    dotColor: 'bg-warning-500',
    borderColor: 'border-warning-300',
    hoverBg: 'hover:bg-warning-50',
  },
  GREEN: {
    label: 'Green',
    description: 'On track — no significant issues',
    bgColor: 'bg-success-100',
    textColor: 'text-success-700',
    dotColor: 'bg-success-500',
    borderColor: 'border-success-300',
    hoverBg: 'hover:bg-success-50',
  },
}

const STATUS_KEYS = ['RED', 'AMBER', 'GREEN']

function RAGStatusBadge({ status, editable, onChange, size }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const dropdownRef = useRef(null)
  const tooltipTimeoutRef = useRef(null)

  const normalizedStatus = status ? status.toUpperCase() : 'GREEN'
  const currentStatus = RAG_STATUSES[normalizedStatus] || RAG_STATUSES.GREEN
  const currentKey = RAG_STATUSES[normalizedStatus] ? normalizedStatus : 'GREEN'

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  const handleSelect = (key) => {
    if (onChange) {
      onChange(key)
    }
    setIsOpen(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen((prev) => !prev)
    }
  }

  const handleOptionKeyDown = (event, key) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(key)
    }
  }

  const handleMouseEnterTooltip = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, 400)
  }

  const handleMouseLeaveTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    setShowTooltip(false)
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
      ? 'px-4 py-2 text-sm'
      : 'px-3 py-1 text-xs'

  const dotSize = size === 'sm'
    ? 'h-1.5 w-1.5'
    : size === 'lg'
      ? 'h-2.5 w-2.5'
      : 'h-2 w-2'

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        className="relative"
        onMouseEnter={handleMouseEnterTooltip}
        onMouseLeave={handleMouseLeaveTooltip}
      >
        <button
          type="button"
          className={`
            inline-flex items-center gap-1.5 rounded-full font-medium
            border transition-all duration-150
            ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}
            ${sizeClasses}
            ${editable ? 'cursor-pointer hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1' : 'cursor-default'}
          `}
          onClick={editable ? () => setIsOpen((prev) => !prev) : undefined}
          onKeyDown={editable ? handleKeyDown : undefined}
          tabIndex={editable ? 0 : -1}
          aria-haspopup={editable ? 'listbox' : undefined}
          aria-expanded={editable ? isOpen : undefined}
          aria-label={`RAG Status: ${currentStatus.label} — ${currentStatus.description}`}
        >
          <span className={`inline-block rounded-full ${currentStatus.dotColor} ${dotSize}`} />
          <span>{currentStatus.label}</span>
          {editable && (
            <ChevronDown
              size={iconSize}
              className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {showTooltip && !isOpen && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fade-in"
            role="tooltip"
          >
            <div className="bg-surface-800 text-white text-xs rounded-lg px-3 py-2 shadow-soft whitespace-nowrap max-w-xs">
              <div className="flex items-center gap-1.5">
                <Info size={12} className="shrink-0 text-surface-300" />
                <span>{currentStatus.description}</span>
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 bg-surface-800 rotate-45 transform" />
            </div>
          </div>
        )}
      </div>

      {editable && isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-white border border-surface-200 rounded-lg shadow-card py-1 min-w-[160px] animate-slide-down"
          role="listbox"
          aria-label="Select RAG status"
        >
          {STATUS_KEYS.map((key) => {
            const option = RAG_STATUSES[key]
            const isSelected = key === currentKey
            return (
              <div
                key={key}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`
                  flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors duration-100
                  ${option.hoverBg}
                  ${isSelected ? `${option.bgColor} font-medium` : 'hover:bg-surface-50'}
                `}
                onClick={() => handleSelect(key)}
                onKeyDown={(e) => handleOptionKeyDown(e, key)}
              >
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${option.dotColor}`} />
                <div className="flex flex-col">
                  <span className={`text-sm ${option.textColor}`}>{option.label}</span>
                  <span className="text-xs text-surface-500">{option.description}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

RAGStatusBadge.propTypes = {
  status: PropTypes.oneOf(['RED', 'AMBER', 'GREEN', 'red', 'amber', 'green', 'Red', 'Amber', 'Green']),
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

RAGStatusBadge.defaultProps = {
  status: 'GREEN',
  editable: false,
  onChange: undefined,
  size: 'md',
}

export default RAGStatusBadge