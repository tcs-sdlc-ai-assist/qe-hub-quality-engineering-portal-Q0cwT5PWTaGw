/**
 * AuditLogManager
 *
 * Manages the audit trail for all dashboard edits in QE Hub.
 * Provides logging, retrieval, filtering, rotation, and CSV export.
 *
 * Persistence: localStorage key "audit_log"
 * Max entries: 1000 (configurable). Oldest entries dropped on overflow.
 *
 * @module AuditLogManager
 */

const STORAGE_KEY = 'audit_log'
const MAX_ENTRIES = 1000
const ROTATION_DROP_COUNT = 100

/**
 * Safely reads and parses JSON from localStorage.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function safeReadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) {
      return fallback
    }
    const parsed = JSON.parse(raw)
    return parsed
  } catch (err) {
    console.error('[AuditLogManager] Failed to read localStorage key "' + key + '":', err)
    return fallback
  }
}

/**
 * Safely writes JSON to localStorage.
 * @param {string} key
 * @param {*} value
 */
function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('[AuditLogManager] Failed to write localStorage key "' + key + '":', err)
  }
}

/**
 * Validates that the stored audit log is a valid array of entries.
 * Filters out malformed entries.
 *
 * @param {*} data
 * @returns {Array|null} validated array or null if completely invalid
 */
function validateLog(data) {
  if (!Array.isArray(data)) {
    console.warn('[AuditLogManager] Audit log corrupted (not an array). Resetting.')
    return null
  }

  return data.filter(function (entry) {
    return (
      entry &&
      typeof entry === 'object' &&
      typeof entry.action === 'string' &&
      typeof entry.field === 'string' &&
      typeof entry.user === 'string' &&
      typeof entry.timestamp === 'number'
    )
  })
}

/**
 * Loads the audit log from localStorage with validation.
 *
 * @returns {Array} The validated audit log entries
 */
function loadLog() {
  const stored = safeReadJSON(STORAGE_KEY, null)

  if (stored === null) {
    return []
  }

  const validated = validateLog(stored)

  if (validated === null) {
    safeWriteJSON(STORAGE_KEY, [])
    return []
  }

  return validated
}

/**
 * Persists the audit log to localStorage.
 *
 * @param {Array} log
 */
function saveLog(log) {
  safeWriteJSON(STORAGE_KEY, log)
}

/**
 * Appends an audit log entry for a dashboard edit action.
 *
 * @param {string} action - The action type (e.g., 'edit', 'upload', 'config_change')
 * @param {string} field - The field that was modified
 * @param {*} oldValue - The previous value
 * @param {*} newValue - The new value
 * @param {string} user - The user who performed the action
 * @param {number} [timestamp] - Unix timestamp in ms (defaults to Date.now())
 */
export function logEdit(action, field, oldValue, newValue, user, timestamp) {
  const log = loadLog()

  const entry = {
    id: generateEntryId(),
    action: action || 'edit',
    field: field || 'unknown',
    oldValue: oldValue !== undefined ? oldValue : null,
    newValue: newValue !== undefined ? newValue : null,
    user: user || 'anonymous',
    timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
  }

  log.push(entry)

  if (log.length > MAX_ENTRIES) {
    const excess = log.length - MAX_ENTRIES
    const dropCount = Math.max(excess, ROTATION_DROP_COUNT)
    log.splice(0, dropCount)
    console.warn('[AuditLogManager] Audit log exceeded ' + MAX_ENTRIES + ' entries. Rotated oldest ' + dropCount + ' entries.')
  }

  saveLog(log)

  return entry
}

/**
 * Returns audit log entries, optionally filtered.
 *
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.action] - Filter by action type
 * @param {string} [filters.field] - Filter by field name
 * @param {string} [filters.user] - Filter by user
 * @param {number} [filters.startTime] - Filter entries after this timestamp (inclusive)
 * @param {number} [filters.endTime] - Filter entries before this timestamp (inclusive)
 * @param {number} [filters.limit] - Maximum number of entries to return
 * @returns {Array} Filtered audit log entries, newest first
 */
export function getAuditLog(filters) {
  let log = loadLog()

  if (filters && typeof filters === 'object') {
    if (filters.action) {
      const actionFilter = filters.action.toLowerCase()
      log = log.filter(function (entry) {
        return entry.action.toLowerCase() === actionFilter
      })
    }

    if (filters.field) {
      const fieldFilter = filters.field.toLowerCase()
      log = log.filter(function (entry) {
        return entry.field.toLowerCase() === fieldFilter
      })
    }

    if (filters.user) {
      const userFilter = filters.user.toLowerCase()
      log = log.filter(function (entry) {
        return entry.user.toLowerCase() === userFilter
      })
    }

    if (typeof filters.startTime === 'number') {
      log = log.filter(function (entry) {
        return entry.timestamp >= filters.startTime
      })
    }

    if (typeof filters.endTime === 'number') {
      log = log.filter(function (entry) {
        return entry.timestamp <= filters.endTime
      })
    }
  }

  const sorted = log.sort(function (a, b) {
    return b.timestamp - a.timestamp
  })

  if (filters && typeof filters.limit === 'number' && filters.limit > 0) {
    return sorted.slice(0, filters.limit)
  }

  return sorted
}

/**
 * Rotates the audit log by removing entries that exceed the max count
 * or entries older than a retention period.
 *
 * @param {number} [maxEntries] - Maximum entries to keep (defaults to MAX_ENTRIES)
 * @param {number} [retentionMs] - Optional retention period in milliseconds.
 *                                  Entries older than (now - retentionMs) are purged.
 * @returns {{ removed: number, remaining: number }}
 */
export function rotateLog(maxEntries, retentionMs) {
  let log = loadLog()
  const originalCount = log.length

  if (typeof retentionMs === 'number' && retentionMs > 0) {
    const cutoff = Date.now() - retentionMs
    log = log.filter(function (entry) {
      return entry.timestamp >= cutoff
    })
  }

  const limit = typeof maxEntries === 'number' && maxEntries > 0 ? maxEntries : MAX_ENTRIES

  if (log.length > limit) {
    log.sort(function (a, b) {
      return b.timestamp - a.timestamp
    })
    log = log.slice(0, limit)
  }

  saveLog(log)

  const removed = originalCount - log.length

  if (removed > 0) {
    console.info('[AuditLogManager] Rotated audit log: removed ' + removed + ' entries, ' + log.length + ' remaining.')
  }

  return {
    removed: removed,
    remaining: log.length,
  }
}

/**
 * Exports the audit log as a CSV string.
 * Columns: id, action, field, oldValue, newValue, user, timestamp, datetime
 *
 * @param {Object} [filters] - Optional filters (same as getAuditLog)
 * @returns {string} CSV-formatted string
 */
export function exportAuditLog(filters) {
  const entries = getAuditLog(filters)

  const headers = ['id', 'action', 'field', 'oldValue', 'newValue', 'user', 'timestamp', 'datetime']
  const rows = [headers.join(',')]

  entries.forEach(function (entry) {
    const datetime = new Date(entry.timestamp).toISOString()
    const row = [
      escapeCsvField(entry.id || ''),
      escapeCsvField(entry.action),
      escapeCsvField(entry.field),
      escapeCsvField(formatValue(entry.oldValue)),
      escapeCsvField(formatValue(entry.newValue)),
      escapeCsvField(entry.user),
      String(entry.timestamp),
      escapeCsvField(datetime),
    ]
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

/**
 * Clears the entire audit log.
 * Should only be called by admin users.
 *
 * @returns {boolean}
 */
export function clearAuditLog() {
  safeWriteJSON(STORAGE_KEY, [])
  console.info('[AuditLogManager] Audit log cleared.')
  return true
}

/**
 * Returns the total count of audit log entries.
 *
 * @returns {number}
 */
export function getAuditLogCount() {
  const log = loadLog()
  return log.length
}

/**
 * Generates a unique entry ID.
 *
 * @returns {string}
 */
function generateEntryId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return 'audit_' + timestamp + '_' + random
}

/**
 * Formats a value for CSV output.
 *
 * @param {*} value
 * @returns {string}
 */
function formatValue(value) {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (err) {
      return String(value)
    }
  }
  return String(value)
}

/**
 * Escapes a field value for CSV output.
 * Wraps in double quotes if the value contains commas, quotes, or newlines.
 *
 * @param {string} field
 * @returns {string}
 */
function escapeCsvField(field) {
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

const AuditLogManager = {
  logEdit,
  getAuditLog,
  rotateLog,
  exportAuditLog,
  clearAuditLog,
  getAuditLogCount,
}

export default AuditLogManager