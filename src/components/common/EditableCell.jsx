import { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Check, X, Pencil } from 'lucide-react'
import EditableFieldManager from '../../EditableFieldManager'

function EditableCell({ fieldName, value, rowId, rowData, fieldConfig, userRole, onUpdateSuccess, onUpdateError }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef(null)

  const isEditable = fieldConfig?.editable === true && fieldConfig?.allowedRoles?.includes(userRole)

  const fieldType = fieldConfig?.type || 'text'
  const options = fieldConfig?.options || []

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (fieldType === 'text' && inputRef.current.select) {
        inputRef.current.select()
      }
    }
  }, [isEditing, fieldType])

  useEffect(() => {
    setEditValue(value ?? '')
  }, [value])

  const handleStartEdit = useCallback(() => {
    if (!isEditable) return
    setEditValue(value ?? '')
    setIsEditing(true)
  }, [isEditable, value])

  const handleCancel = useCallback(() => {
    setEditValue(value ?? '')
    setIsEditing(false)
  }, [value])

  const handleSave = useCallback(async () => {
    const trimmedValue = typeof editValue === 'string' ? editValue.trim() : editValue
    const currentValue = value ?? ''

    if (trimmedValue === currentValue) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await EditableFieldManager.updateField({
        rowId,
        fieldName,
        value: trimmedValue,
        rowData,
      })
      setIsEditing(false)
      if (onUpdateSuccess) {
        onUpdateSuccess({ rowId, fieldName, value: trimmedValue })
      }
    } catch (error) {
      const message = error?.message || 'Failed to update field'
      if (onUpdateError) {
        onUpdateError({ rowId, fieldName, error: message })
      }
    } finally {
      setIsSaving(false)
    }
  }, [editValue, value, rowId, fieldName, rowData, onUpdateSuccess, onUpdateError])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }, [handleSave, handleCancel])

  const handleSelectChange = useCallback((e) => {
    setEditValue(e.target.value)
  }, [])

  const handleInputChange = useCallback((e) => {
    const newValue = fieldType === 'number' ? e.target.value : e.target.value
    setEditValue(newValue)
  }, [fieldType])

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        {fieldType === 'select' ? (
          <select
            ref={inputRef}
            value={editValue}
            onChange={handleSelectChange}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="w-full rounded border border-brand-500 bg-white px-2 py-1 text-sm text-surface-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 font-sans"
          >
            <option value="">— Select —</option>
            {options.map((opt) => {
              const optValue = typeof opt === 'object' ? opt.value : opt
              const optLabel = typeof opt === 'object' ? opt.label : opt
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              )
            })}
          </select>
        ) : (
          <input
            ref={inputRef}
            type={fieldType === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="w-full rounded border border-brand-500 bg-white px-2 py-1 text-sm text-surface-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 font-sans"
          />
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          aria-label="Save"
          className="flex-shrink-0 rounded p-1 text-success-600 hover:bg-success-50 focus:outline-none focus:ring-2 focus:ring-success-500 disabled:opacity-50 transition-colors"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          aria-label="Cancel"
          className="flex-shrink-0 rounded p-1 text-danger-600 hover:bg-danger-50 focus:outline-none focus:ring-2 focus:ring-danger-500 disabled:opacity-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const displayValue = value != null && value !== '' ? String(value) : '—'

  if (isEditable) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleStartEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleStartEdit()
          }
        }}
        className="group flex items-center gap-1 cursor-pointer rounded px-1 py-0.5 -mx-1 hover:bg-surface-100 transition-colors min-w-0"
        title="Click to edit"
      >
        <span className="truncate text-sm text-surface-900 font-sans">{displayValue}</span>
        <Pencil className="h-3 w-3 flex-shrink-0 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  return (
    <span className="truncate text-sm text-surface-900 font-sans">{displayValue}</span>
  )
}

EditableCell.propTypes = {
  fieldName: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  rowData: PropTypes.object,
  fieldConfig: PropTypes.shape({
    editable: PropTypes.bool,
    type: PropTypes.oneOf(['text', 'number', 'select']),
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }),
      ])
    ),
  }),
  userRole: PropTypes.string,
  onUpdateSuccess: PropTypes.func,
  onUpdateError: PropTypes.func,
}

EditableCell.defaultProps = {
  value: null,
  rowData: {},
  fieldConfig: {
    editable: false,
    type: 'text',
    allowedRoles: [],
    options: [],
  },
  userRole: '',
  onUpdateSuccess: null,
  onUpdateError: null,
}

export default EditableCell