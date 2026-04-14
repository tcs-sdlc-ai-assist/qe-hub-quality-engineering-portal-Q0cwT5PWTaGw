import { useState, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDownIcon,
  ChevronRightIcon,
  Loader2,
  Inbox,
  Check,
  X,
  Pencil,
} from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function SortIcon({ direction }) {
  if (direction === 'asc') {
    return <ChevronUp className="w-4 h-4 text-brand-600" />
  }
  if (direction === 'desc') {
    return <ChevronDown className="w-4 h-4 text-brand-600" />
  }
  return <ChevronsUpDown className="w-4 h-4 text-surface-400" />
}

SortIcon.propTypes = {
  direction: PropTypes.oneOf(['asc', 'desc', null]),
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-surface-500">
      <Inbox className="w-12 h-12 mb-3 text-surface-300" />
      <p className="text-sm font-medium">{message || 'No data available'}</p>
    </div>
  )
}

EmptyState.propTypes = {
  message: PropTypes.string,
}

function LoadingState({ columnCount }) {
  const rows = Array.from({ length: 5 })
  const cols = Array.from({ length: columnCount })
  return (
    <tbody>
      {rows.map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {cols.map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div className="h-4 bg-surface-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

LoadingState.propTypes = {
  columnCount: PropTypes.number.isRequired,
}

function InlineEditCell({ value, onSave, onCancel }) {
  const [editValue, setEditValue] = useState(value ?? '')

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        onSave(editValue)
      } else if (e.key === 'Escape') {
        onCancel()
      }
    },
    [editValue, onSave, onCancel]
  )

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        className="w-full px-2 py-1 text-sm border border-brand-400 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Edit cell value"
      />
      <button
        type="button"
        onClick={() => onSave(editValue)}
        className="p-1 text-success-600 hover:bg-success-50 rounded transition-colors"
        aria-label="Save edit"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 text-danger-600 hover:bg-danger-50 rounded transition-colors"
        aria-label="Cancel edit"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

InlineEditCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

function Pagination({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-surface-200 bg-surface-50">
      <div className="flex items-center gap-2 text-sm text-surface-600">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-surface-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-surface-600">
          {startItem}–{endItem} of {totalItems}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm font-medium text-surface-700">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
}

function getCurrentUserRole() {
  return import.meta.env.VITE_DEFAULT_ROLE || 'engineer'
}

function isFieldEditable(columnKey, userRole) {
  if (!columnKey) return false
  if (userRole === 'manager' || userRole === 'lead') return true
  return false
}

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage,
  sortable,
  paginated,
  defaultPageSize,
  expandable,
  renderExpandedRow,
  onCellEdit,
  editableColumns,
  getRowId,
  className,
  stickyHeader,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || 10)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [editingCell, setEditingCell] = useState(null)

  const userRole = useMemo(() => getCurrentUserRole(), [])

  const editableColumnKeys = useMemo(() => {
    if (!editableColumns) return new Set()
    return new Set(editableColumns)
  }, [editableColumns])

  const handleSort = useCallback(
    (columnKey) => {
      if (!sortable) return
      setSortConfig((prev) => {
        if (prev.key === columnKey) {
          if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' }
          if (prev.direction === 'desc') return { key: null, direction: null }
        }
        return { key: columnKey, direction: 'asc' }
      })
      setCurrentPage(1)
    },
    [sortable]
  )

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction || !data) return data || []
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [data, sortConfig])

  const totalItems = sortedData.length
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, paginated, currentPage, pageSize])

  const handlePageChange = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(safePage)
    },
    [totalPages]
  )

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }, [])

  const toggleRowExpansion = useCallback((rowId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }, [])

  const resolveRowId = useCallback(
    (row, index) => {
      if (getRowId) return getRowId(row)
      if (row.id != null) return row.id
      return index
    },
    [getRowId]
  )

  const handleStartEdit = useCallback(
    (rowId, columnKey) => {
      if (!editableColumnKeys.has(columnKey)) return
      if (!isFieldEditable(columnKey, userRole)) return
      setEditingCell({ rowId, columnKey })
    },
    [editableColumnKeys, userRole]
  )

  const handleSaveEdit = useCallback(
    (rowId, columnKey, newValue) => {
      setEditingCell(null)
      if (onCellEdit) {
        try {
          onCellEdit(rowId, columnKey, newValue)
        } catch (err) {
          console.error('Failed to save cell edit:', err)
        }
      }
    },
    [onCellEdit]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  const visibleColumnCount = columns.length + (expandable ? 1 : 0)

  const renderCellContent = (row, column, rowId) => {
    const isEditing =
      editingCell && editingCell.rowId === rowId && editingCell.columnKey === column.key

    if (isEditing) {
      return (
        <InlineEditCell
          value={row[column.key]}
          onSave={(newValue) => handleSaveEdit(rowId, column.key, newValue)}
          onCancel={handleCancelEdit}
        />
      )
    }

    const cellValue = column.render ? column.render(row[column.key], row) : row[column.key]
    const canEdit =
      editableColumnKeys.has(column.key) && isFieldEditable(column.key, userRole) && onCellEdit

    return (
      <div className="flex items-center gap-1 group/cell">
        <span className="truncate">{cellValue ?? '—'}</span>
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleStartEdit(rowId, column.key)
            }}
            className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-surface-400 hover:text-brand-600 transition-opacity"
            aria-label={`Edit ${column.header || column.key}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-card border border-surface-200 overflow-hidden ${className || ''}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Data table">
          <thead
            className={`bg-surface-50 border-b border-surface-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
          >
            <tr role="row">
              {expandable && (
                <th
                  className="w-10 px-2 py-3"
                  role="columnheader"
                  aria-label="Expand row"
                />
              )}
              {columns.map((column) => {
                const isSortable = sortable && column.sortable !== false
                const sortDirection =
                  sortConfig.key === column.key ? sortConfig.direction : null

                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider ${
                      isSortable ? 'cursor-pointer select-none hover:bg-surface-100 transition-colors' : ''
                    } ${column.headerClassName || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={isSortable ? () => handleSort(column.key) : undefined}
                    role="columnheader"
                    aria-sort={
                      sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                    tabIndex={isSortable ? 0 : undefined}
                    onKeyDown={
                      isSortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSort(column.key)
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {isSortable && <SortIcon direction={sortDirection} />}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          {loading ? (
            <LoadingState columnCount={visibleColumnCount} />
          ) : paginatedData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={visibleColumnCount}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-surface-100">
              {paginatedData.map((row, index) => {
                const rowId = resolveRowId(row, index)
                const isExpanded = expandedRows.has(rowId)

                return (
                  <Fragment key={rowId}>
                    <tr
                      className="hover:bg-surface-50 transition-colors"
                      role="row"
                      aria-expanded={expandable ? isExpanded : undefined}
                    >
                      {expandable && (
                        <td className="w-10 px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(rowId)}
                            className="p-1 rounded hover:bg-surface-200 transition-colors text-surface-500"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-surface-700 ${column.cellClassName || ''}`}
                          role="cell"
                        >
                          {renderCellContent(row, column, rowId)}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && renderExpandedRow && (
                      <tr className="bg-surface-50" role="row">
                        <td
                          colSpan={visibleColumnCount}
                          className="px-4 py-4 border-t border-surface-100"
                        >
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          )}
        </table>
      </div>
      {paginated && !loading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}

import { Fragment } from 'react'

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  sortable: PropTypes.bool,
  paginated: PropTypes.bool,
  defaultPageSize: PropTypes.number,
  expandable: PropTypes.bool,
  renderExpandedRow: PropTypes.func,
  onCellEdit: PropTypes.func,
  editableColumns: PropTypes.arrayOf(PropTypes.string),
  getRowId: PropTypes.func,
  className: PropTypes.string,
  stickyHeader: PropTypes.bool,
}

DataTable.defaultProps = {
  data: [],
  loading: false,
  emptyMessage: 'No data available',
  sortable: true,
  paginated: true,
  defaultPageSize: 10,
  expandable: false,
  renderExpandedRow: null,
  onCellEdit: null,
  editableColumns: [],
  getRowId: null,
  className: '',
  stickyHeader: false,
}
```

Wait, I have a problem — I imported `Fragment` after the component definition. That's invalid in ES modules; all imports must be at the top. Let me fix this.

```jsx
import { useState, useMemo, useCallback, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Inbox,
  Check,
  X,
  Pencil,
  ChevronDown as ChevronDownExpand,
  ChevronRight as ChevronRightExpand,
} from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function SortIcon({ direction }) {
  if (direction === 'asc') {
    return <ChevronUp className="w-4 h-4 text-brand-600" />
  }
  if (direction === 'desc') {
    return <ChevronDown className="w-4 h-4 text-brand-600" />
  }
  return <ChevronsUpDown className="w-4 h-4 text-surface-400" />
}

SortIcon.propTypes = {
  direction: PropTypes.oneOf(['asc', 'desc', null]),
}

function TableEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-surface-500">
      <Inbox className="w-12 h-12 mb-3 text-surface-300" />
      <p className="text-sm font-medium">{message || 'No data available'}</p>
    </div>
  )
}

TableEmptyState.propTypes = {
  message: PropTypes.string,
}

function LoadingState({ columnCount }) {
  const rows = Array.from({ length: 5 })
  const cols = Array.from({ length: columnCount })
  return (
    <tbody>
      {rows.map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {cols.map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div className="h-4 bg-surface-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

LoadingState.propTypes = {
  columnCount: PropTypes.number.isRequired,
}

function InlineEditCell({ value, onSave, onCancel }) {
  const [editValue, setEditValue] = useState(value ?? '')

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        onSave(editValue)
      } else if (e.key === 'Escape') {
        onCancel()
      }
    },
    [editValue, onSave, onCancel]
  )

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        className="w-full px-2 py-1 text-sm border border-brand-400 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Edit cell value"
      />
      <button
        type="button"
        onClick={() => onSave(editValue)}
        className="p-1 text-success-600 hover:bg-success-50 rounded transition-colors"
        aria-label="Save edit"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 text-danger-600 hover:bg-danger-50 rounded transition-colors"
        aria-label="Cancel edit"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

InlineEditCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

function PaginationControls({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-surface-200 bg-surface-50">
      <div className="flex items-center gap-2 text-sm text-surface-600">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-surface-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-surface-600">
          {startItem}–{endItem} of {totalItems}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm font-medium text-surface-700">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
}

function getCurrentUserRole() {
  return import.meta.env.VITE_DEFAULT_ROLE || 'engineer'
}

function isFieldEditable(columnKey, userRole) {
  if (!columnKey) return false
  if (userRole === 'manager' || userRole === 'lead') return true
  return false
}

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage,
  sortable,
  paginated,
  defaultPageSize,
  expandable,
  renderExpandedRow,
  onCellEdit,
  editableColumns,
  getRowId,
  className,
  stickyHeader,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || 10)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [editingCell, setEditingCell] = useState(null)

  const userRole = useMemo(() => getCurrentUserRole(), [])

  const editableColumnKeys = useMemo(() => {
    if (!editableColumns) return new Set()
    return new Set(editableColumns)
  }, [editableColumns])

  const handleSort = useCallback(
    (columnKey) => {
      if (!sortable) return
      setSortConfig((prev) => {
        if (prev.key === columnKey) {
          if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' }
          if (prev.direction === 'desc') return { key: null, direction: null }
        }
        return { key: columnKey, direction: 'asc' }
      })
      setCurrentPage(1)
    },
    [sortable]
  )

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction || !data) return data || []
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [data, sortConfig])

  const totalItems = sortedData.length
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, paginated, currentPage, pageSize])

  const handlePageChange = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(safePage)
    },
    [totalPages]
  )

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }, [])

  const toggleRowExpansion = useCallback((rowId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }, [])

  const resolveRowId = useCallback(
    (row, index) => {
      if (getRowId) return getRowId(row)
      if (row.id != null) return row.id
      return index
    },
    [getRowId]
  )

  const handleStartEdit = useCallback(
    (rowId, columnKey) => {
      if (!editableColumnKeys.has(columnKey)) return
      if (!isFieldEditable(columnKey, userRole)) return
      setEditingCell({ rowId, columnKey })
    },
    [editableColumnKeys, userRole]
  )

  const handleSaveEdit = useCallback(
    (rowId, columnKey, newValue) => {
      setEditingCell(null)
      if (onCellEdit) {
        try {
          onCellEdit(rowId, columnKey, newValue)
        } catch (err) {
          console.error('Failed to save cell edit:', err)
        }
      }
    },
    [onCellEdit]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  const visibleColumnCount = columns.length + (expandable ? 1 : 0)

  const renderCellContent = (row, column, rowId) => {
    const isEditing =
      editingCell && editingCell.rowId === rowId && editingCell.columnKey === column.key

    if (isEditing) {
      return (
        <InlineEditCell
          value={row[column.key]}
          onSave={(newValue) => handleSaveEdit(rowId, column.key, newValue)}
          onCancel={handleCancelEdit}
        />
      )
    }

    const cellValue = column.render ? column.render(row[column.key], row) : row[column.key]
    const canEdit =
      editableColumnKeys.has(column.key) && isFieldEditable(column.key, userRole) && onCellEdit

    return (
      <div className="flex items-center gap-1 group/cell">
        <span className="truncate">{cellValue ?? '—'}</span>
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleStartEdit(rowId, column.key)
            }}
            className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-surface-400 hover:text-brand-600 transition-opacity"
            aria-label={`Edit ${column.header || column.key}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-card border border-surface-200 overflow-hidden ${className || ''}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Data table">
          <thead
            className={`bg-surface-50 border-b border-surface-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
          >
            <tr role="row">
              {expandable && (
                <th
                  className="w-10 px-2 py-3"
                  role="columnheader"
                  aria-label="Expand row"
                />
              )}
              {columns.map((column) => {
                const isSortable = sortable && column.sortable !== false
                const sortDirection =
                  sortConfig.key === column.key ? sortConfig.direction : null

                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider ${
                      isSortable ? 'cursor-pointer select-none hover:bg-surface-100 transition-colors' : ''
                    } ${column.headerClassName || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={isSortable ? () => handleSort(column.key) : undefined}
                    role="columnheader"
                    aria-sort={
                      sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                    tabIndex={isSortable ? 0 : undefined}
                    onKeyDown={
                      isSortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSort(column.key)
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {isSortable && <SortIcon direction={sortDirection} />}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          {loading ? (
            <LoadingState columnCount={visibleColumnCount} />
          ) : paginatedData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={visibleColumnCount}>
                  <TableEmptyState message={emptyMessage} />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-surface-100">
              {paginatedData.map((row, index) => {
                const rowId = resolveRowId(row, index)
                const isExpanded = expandedRows.has(rowId)

                return (
                  <Fragment key={rowId}>
                    <tr
                      className="hover:bg-surface-50 transition-colors"
                      role="row"
                      aria-expanded={expandable ? isExpanded : undefined}
                    >
                      {expandable && (
                        <td className="w-10 px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(rowId)}
                            className="p-1 rounded hover:bg-surface-200 transition-colors text-surface-500"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? (
                              <ChevronDownExpand className="w-4 h-4" />
                            ) : (
                              <ChevronRightExpand className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-surface-700 ${column.cellClassName || ''}`}
                          role="cell"
                        >
                          {renderCellContent(row, column, rowId)}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && renderExpandedRow && (
                      <tr className="bg-surface-50" role="row">
                        <td
                          colSpan={visibleColumnCount}
                          className="px-4 py-4 border-t border-surface-100"
                        >
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          )}
        </table>
      </div>
      {paginated && !loading && totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  sortable: PropTypes.bool,
  paginated: PropTypes.bool,
  defaultPageSize: PropTypes.number,
  expandable: PropTypes.bool,
  renderExpandedRow: PropTypes.func,
  onCellEdit: PropTypes.func,
  editableColumns: PropTypes.arrayOf(PropTypes.string),
  getRowId: PropTypes.func,
  className: PropTypes.string,
  stickyHeader: PropTypes.bool,
}

DataTable.defaultProps = {
  data: [],
  loading: false,
  emptyMessage: 'No data available',
  sortable: true,
  paginated: true,
  defaultPageSize: 10,
  expandable: false,
  renderExpandedRow: null,
  onCellEdit: null,
  editableColumns: [],
  getRowId: null,
  className: '',
  stickyHeader: false,
}
```

Hmm, I have a problem with the duplicate named imports from lucide-react. `ChevronDown` is imported twice (once for sort, once aliased for expand), and `ChevronRight` similarly. The alias syntax `ChevronDown as ChevronDownExpand` should work in ES modules, but let me reconsider — actually `ChevronDown` and `ChevronRight` are already imported for pagination. I'm importing them again with aliases. That's fine syntactically but redundant. Let me just reuse the same icons without aliases. Also I had `Loader2` imported but unused — need to remove that.

Let me produce the final clean version:

```jsx
import { useState, useMemo, useCallback, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Check,
  X,
  Pencil,
} from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function SortIcon({ direction }) {
  if (direction === 'asc') {
    return <ChevronUp className="w-4 h-4 text-brand-600" />
  }
  if (direction === 'desc') {
    return <ChevronDown className="w-4 h-4 text-brand-600" />
  }
  return <ChevronsUpDown className="w-4 h-4 text-surface-400" />
}

SortIcon.propTypes = {
  direction: PropTypes.oneOf(['asc', 'desc', null]),
}

function TableEmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-surface-500">
      <Inbox className="w-12 h-12 mb-3 text-surface-300" />
      <p className="text-sm font-medium">{message || 'No data available'}</p>
    </div>
  )
}

TableEmptyState.propTypes = {
  message: PropTypes.string,
}

function LoadingState({ columnCount }) {
  const rows = Array.from({ length: 5 })
  const cols = Array.from({ length: columnCount })
  return (
    <tbody>
      {rows.map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {cols.map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div className="h-4 bg-surface-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

LoadingState.propTypes = {
  columnCount: PropTypes.number.isRequired,
}

function InlineEditCell({ value, onSave, onCancel }) {
  const [editValue, setEditValue] = useState(value ?? '')

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        onSave(editValue)
      } else if (e.key === 'Escape') {
        onCancel()
      }
    },
    [editValue, onSave, onCancel]
  )

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        className="w-full px-2 py-1 text-sm border border-brand-400 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="Edit cell value"
      />
      <button
        type="button"
        onClick={() => onSave(editValue)}
        className="p-1 text-success-600 hover:bg-success-50 rounded transition-colors"
        aria-label="Save edit"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 text-danger-600 hover:bg-danger-50 rounded transition-colors"
        aria-label="Cancel edit"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

InlineEditCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

function PaginationControls({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-surface-200 bg-surface-50">
      <div className="flex items-center gap-2 text-sm text-surface-600">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-surface-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Rows per page"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-surface-600">
          {startItem}–{endItem} of {totalItems}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm font-medium text-surface-700">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
}

function getCurrentUserRole() {
  return import.meta.env.VITE_DEFAULT_ROLE || 'engineer'
}

function isFieldEditable(columnKey, userRole) {
  if (!columnKey) return false
  if (userRole === 'manager' || userRole === 'lead') return true
  return false
}

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage,
  sortable,
  paginated,
  defaultPageSize,
  expandable,
  renderExpandedRow,
  onCellEdit,
  editableColumns,
  getRowId,
  className,
  stickyHeader,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || 10)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [editingCell, setEditingCell] = useState(null)

  const userRole = useMemo(() => getCurrentUserRole(), [])

  const editableColumnKeys = useMemo(() => {
    if (!editableColumns) return new Set()
    return new Set(editableColumns)
  }, [editableColumns])

  const handleSort = useCallback(
    (columnKey) => {
      if (!sortable) return
      setSortConfig((prev) => {
        if (prev.key === columnKey) {
          if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' }
          if (prev.direction === 'desc') return { key: null, direction: null }
        }
        return { key: columnKey, direction: 'asc' }
      })
      setCurrentPage(1)
    },
    [sortable]
  )

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction || !data) return data || []
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [data, sortConfig])

  const totalItems = sortedData.length
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, paginated, currentPage, pageSize])

  const handlePageChange = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(safePage)
    },
    [totalPages]
  )

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }, [])

  const toggleRowExpansion = useCallback((rowId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) {
        next.delete(rowId)
      } else {
        next.add(rowId)
      }
      return next
    })
  }, [])

  const resolveRowId = useCallback(
    (row, index) => {
      if (getRowId) return getRowId(row)
      if (row.id != null) return row.id
      return index
    },
    [getRowId]
  )

  const handleStartEdit = useCallback(
    (rowId, columnKey) => {
      if (!editableColumnKeys.has(columnKey)) return
      if (!isFieldEditable(columnKey, userRole)) return
      setEditingCell({ rowId, columnKey })
    },
    [editableColumnKeys, userRole]
  )

  const handleSaveEdit = useCallback(
    (rowId, columnKey, newValue) => {
      setEditingCell(null)
      if (onCellEdit) {
        try {
          onCellEdit(rowId, columnKey, newValue)
        } catch (err) {
          console.error('Failed to save cell edit:', err)
        }
      }
    },
    [onCellEdit]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null)
  }, [])

  const visibleColumnCount = columns.length + (expandable ? 1 : 0)

  const renderCellContent = (row, column, rowId) => {
    const isEditing =
      editingCell && editingCell.rowId === rowId && editingCell.columnKey === column.key

    if (isEditing) {
      return (
        <InlineEditCell
          value={row[column.key]}
          onSave={(newValue) => handleSaveEdit(rowId, column.key, newValue)}
          onCancel={handleCancelEdit}
        />
      )
    }

    const cellValue = column.render ? column.render(row[column.key], row) : row[column.key]
    const canEdit =
      editableColumnKeys.has(column.key) && isFieldEditable(column.key, userRole) && onCellEdit

    return (
      <div className="flex items-center gap-1 group/cell">
        <span className="truncate">{cellValue ?? '—'}</span>
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleStartEdit(rowId, column.key)
            }}
            className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-surface-400 hover:text-brand-600 transition-opacity"
            aria-label={`Edit ${column.header || column.key}`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-card border border-surface-200 overflow-hidden ${className || ''}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Data table">
          <thead
            className={`bg-surface-50 border-b border-surface-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
          >
            <tr role="row">
              {expandable && (
                <th
                  className="w-10 px-2 py-3"
                  role="columnheader"
                  aria-label="Expand row"
                />
              )}
              {columns.map((column) => {
                const isSortable = sortable && column.sortable !== false
                const sortDirection =
                  sortConfig.key === column.key ? sortConfig.direction : null

                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider ${
                      isSortable ? 'cursor-pointer select-none hover:bg-surface-100 transition-colors' : ''
                    } ${column.headerClassName || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={isSortable ? () => handleSort(column.key) : undefined}
                    role="columnheader"
                    aria-sort={
                      sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                    tabIndex={isSortable ? 0 : undefined}
                    onKeyDown={
                      isSortable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSort(column.key)
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {isSortable && <SortIcon direction={sortDirection} />}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          {loading ? (
            <LoadingState columnCount={visibleColumnCount} />
          ) : paginatedData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={visibleColumnCount}>
                  <TableEmptyState message={emptyMessage} />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-surface-100">
              {paginatedData.map((row, index) => {
                const rowId = resolveRowId(row, index)
                const isExpanded = expandedRows.has(rowId)

                return (
                  <Fragment key={rowId}>
                    <tr
                      className="hover:bg-surface-50 transition-colors"
                      role="row"
                      aria-expanded={expandable ? isExpanded : undefined}
                    >
                      {expandable && (
                        <td className="w-10 px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(rowId)}
                            className="p-1 rounded hover:bg-surface-200 transition-colors text-surface-500"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-3 text-surface-700 ${column.cellClassName || ''}`}
                          role="cell"
                        >
                          {renderCellContent(row, column, rowId)}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && renderExpandedRow && (
                      <tr className="bg-surface-50" role="row">
                        <td
                          colSpan={visibleColumnCount}
                          className="px-4 py-4 border-t border-surface-100"
                        >
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          )}
        </table>
      </div>
      {paginated && !loading && totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.string,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  sortable: PropTypes.bool,
  paginated: PropTypes.bool,
  defaultPageSize: PropTypes.number,
  expandable: PropTypes.bool,
  renderExpandedRow: PropTypes.func,
  onCellEdit: PropTypes.func,
  editableColumns: PropTypes.arrayOf(PropTypes.string),
  getRowId: PropTypes.func,
  className: PropTypes.string,
  stickyHeader: PropTypes.bool,
}

DataTable.defaultProps = {
  data: [],
  loading: false,
  emptyMessage: 'No data available',
  sortable: true,
  paginated: true,
  defaultPageSize: 10,
  expandable: false,
  renderExpandedRow: null,
  onCellEdit: null,
  editableColumns: [],
  getRowId: null,
  className: '',
  stickyHeader: false,
}