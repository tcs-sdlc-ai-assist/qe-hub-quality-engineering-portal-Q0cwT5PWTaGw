/**
 * Data formatting and display helper utilities.
 * Pure functions — no JSX, no React dependencies.
 */

/**
 * Formats a date value into a human-readable string.
 * @param {string|number|Date} value - Date input (ISO string, timestamp, or Date object)
 * @param {object} [options] - Intl.DateTimeFormat options override
 * @returns {string} Formatted date string or '—' if invalid
 */
export function formatDate(value, options) {
  if (!value) return '—'
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (isNaN(date.getTime())) return '—'
    const defaults = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options || defaults)
  } catch {
    return '—'
  }
}

/**
 * Formats a number as a percentage string.
 * @param {number} value - The numeric value (0–100 or 0–1 depending on isDecimal)
 * @param {number} [decimals=1] - Number of decimal places
 * @param {boolean} [isDecimal=false] - If true, treats value as 0–1 and multiplies by 100
 * @returns {string} Formatted percentage string (e.g. "85.0%") or '—' if invalid
 */
export function formatPercentage(value, decimals = 1, isDecimal = false) {
  if (value === null || value === undefined || isNaN(Number(value))) return '—'
  const num = isDecimal ? Number(value) * 100 : Number(value)
  return `${num.toFixed(decimals)}%`
}

/**
 * Calculates the number of days between a created date and now.
 * @param {string|number|Date} createdDate - The creation date
 * @returns {number} Number of whole days elapsed, or -1 if invalid
 */
export function calculateAging(createdDate) {
  if (!createdDate) return -1
  try {
    const created = createdDate instanceof Date ? createdDate : new Date(createdDate)
    if (isNaN(created.getTime())) return -1
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    if (diffMs < 0) return 0
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return -1
  }
}

/**
 * Formats a number with locale-aware thousand separators.
 * @param {number} value - The numeric value
 * @param {number} [decimals] - Fixed decimal places (omit for auto)
 * @returns {string} Formatted number string or '—' if invalid
 */
export function formatNumber(value, decimals) {
  if (value === null || value === undefined || isNaN(Number(value))) return '—'
  const num = Number(value)
  const opts = decimals !== undefined
    ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    : {}
  return num.toLocaleString('en-US', opts)
}

/**
 * Truncates text to a maximum length and appends an ellipsis.
 * @param {string} text - The input text
 * @param {number} [maxLength=100] - Maximum character length before truncation
 * @returns {string} Truncated text or original if shorter than maxLength
 */
export function truncateText(text, maxLength = 100) {
  if (!text || typeof text !== 'string') return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Returns a Tailwind text/bg color class based on RAG (Red/Amber/Green) status.
 * @param {'red'|'amber'|'green'|string} status - RAG status value
 * @param {'text'|'bg'|'both'} [variant='text'] - Which color type to return
 * @returns {string} Tailwind class string
 */
export function getRAGColor(status, variant = 'text') {
  const normalized = (status || '').toLowerCase().trim()

  const colorMap = {
    red: { text: 'text-danger-600', bg: 'bg-danger-100' },
    amber: { text: 'text-warning-600', bg: 'bg-warning-100' },
    yellow: { text: 'text-warning-600', bg: 'bg-warning-100' },
    green: { text: 'text-success-600', bg: 'bg-success-100' },
  }

  const colors = colorMap[normalized] || { text: 'text-surface-500', bg: 'bg-surface-100' }

  if (variant === 'bg') return colors.bg
  if (variant === 'both') return `${colors.text} ${colors.bg}`
  return colors.text
}

/**
 * Returns Tailwind color classes for severity levels.
 * @param {'critical'|'high'|'medium'|'low'|string} severity - Severity level
 * @param {'text'|'bg'|'both'} [variant='text'] - Which color type to return
 * @returns {string} Tailwind class string
 */
export function getSeverityColor(severity, variant = 'text') {
  const normalized = (severity || '').toLowerCase().trim()

  const colorMap = {
    critical: { text: 'text-danger-700', bg: 'bg-danger-100' },
    high: { text: 'text-danger-600', bg: 'bg-danger-50' },
    medium: { text: 'text-warning-600', bg: 'bg-warning-100' },
    low: { text: 'text-success-600', bg: 'bg-success-100' },
  }

  const colors = colorMap[normalized] || { text: 'text-surface-500', bg: 'bg-surface-100' }

  if (variant === 'bg') return colors.bg
  if (variant === 'both') return `${colors.text} ${colors.bg}`
  return colors.text
}

/**
 * Returns a full set of Tailwind classes for a status badge.
 * @param {'open'|'in_progress'|'in progress'|'closed'|'resolved'|'blocked'|'pending'|string} status - Status value
 * @returns {string} Tailwind class string suitable for a badge element
 */
export function getStatusBadgeClass(status) {
  const normalized = (status || '').toLowerCase().trim().replace(/[\s_-]+/g, '_')

  const classMap = {
    open: 'bg-brand-100 text-brand-700',
    in_progress: 'bg-warning-100 text-warning-700',
    closed: 'bg-surface-200 text-surface-600',
    resolved: 'bg-success-100 text-success-700',
    blocked: 'bg-danger-100 text-danger-700',
    pending: 'bg-warning-50 text-warning-600',
    done: 'bg-success-100 text-success-700',
    cancelled: 'bg-surface-200 text-surface-500',
    active: 'bg-success-100 text-success-700',
    inactive: 'bg-surface-200 text-surface-500',
  }

  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const colorClasses = classMap[normalized] || 'bg-surface-100 text-surface-600'

  return `${base} ${colorClasses}`
}