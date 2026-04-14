/**
 * EditableFieldConfigManager
 *
 * Manages the configuration of which dashboard fields are editable.
 * Admins can add/remove fields from the editable list.
 * Test Leads and Admins can edit fields that appear in this list.
 *
 * Persistence: localStorage key "editable_fields"
 *
 * @module EditableFieldConfigManager
 */

const STORAGE_KEY = 'editable_fields'
const CONFIG_VERSION_KEY = 'editable_fields_version'
const CURRENT_VERSION = 1

/**
 * Default editable fields for a fresh installation.
 * These represent the core dashboard fields that are commonly edited.
 */
const DEFAULT_EDITABLE_FIELDS = [
  'rag_status',
  'test_progress',
  'defect_count',
  'automation_coverage',
  'environment_status',
  'release_readiness',
  'blocker_count',
  'notes',
]

/**
 * Known dashboard fields (superset of editable fields).
 * Used for validation when adding new fields.
 */
const KNOWN_FIELDS = [
  'rag_status',
  'test_progress',
  'defect_count',
  'automation_coverage',
  'environment_status',
  'release_readiness',
  'blocker_count',
  'notes',
  'release_name',
  'project_name',
  'test_lead',
  'start_date',
  'end_date',
  'total_test_cases',
  'passed_test_cases',
  'failed_test_cases',
  'blocked_test_cases',
  'not_executed_test_cases',
  'critical_defects',
  'major_defects',
  'minor_defects',
  'test_environment',
  'build_version',
  'sprint_name',
  'confidence_level',
]

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
    console.error('[EditableFieldConfigManager] Failed to read localStorage key "' + key + '":', err)
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
    console.error('[EditableFieldConfigManager] Failed to write localStorage key "' + key + '":', err)
  }
}

/**
 * Validates that the stored config is a valid array of strings.
 * If corrupted, resets to defaults and logs a warning.
 *
 * @param {*} data
 * @returns {string[]}
 */
function validateConfig(data) {
  if (!Array.isArray(data)) {
    console.warn('[EditableFieldConfigManager] Config corrupted (not an array). Resetting to defaults.')
    return null
  }

  const valid = data.filter(function (item) {
    return typeof item === 'string' && item.trim().length > 0
  })

  if (valid.length !== data.length) {
    console.warn('[EditableFieldConfigManager] Config contained invalid entries. Cleaned up.')
  }

  return valid.map(function (f) {
    return f.trim().toLowerCase()
  })
}

/**
 * Checks config version and migrates if necessary.
 */
function ensureConfigVersion() {
  try {
    const storedVersion = localStorage.getItem(CONFIG_VERSION_KEY)
    const version = storedVersion ? parseInt(storedVersion, 10) : 0

    if (version < CURRENT_VERSION) {
      localStorage.setItem(CONFIG_VERSION_KEY, String(CURRENT_VERSION))
    }
  } catch (err) {
    console.error('[EditableFieldConfigManager] Version check failed:', err)
  }
}

/**
 * Returns the current list of editable fields from localStorage.
 * Falls back to defaults if not configured or corrupted.
 *
 * @returns {string[]}
 */
export function getEditableFields() {
  ensureConfigVersion()

  const stored = safeReadJSON(STORAGE_KEY, null)

  if (stored === null) {
    safeWriteJSON(STORAGE_KEY, DEFAULT_EDITABLE_FIELDS)
    return [...DEFAULT_EDITABLE_FIELDS]
  }

  const validated = validateConfig(stored)

  if (validated === null) {
    safeWriteJSON(STORAGE_KEY, DEFAULT_EDITABLE_FIELDS)
    return [...DEFAULT_EDITABLE_FIELDS]
  }

  return validated
}

/**
 * Replaces the entire editable fields configuration.
 * Only callable by admin users (caller should verify role).
 *
 * @param {string[]} fields - Array of field names to set as editable
 * @returns {boolean} true if set successfully
 */
export function setEditableFields(fields) {
  if (!Array.isArray(fields)) {
    console.error('[EditableFieldConfigManager] setEditableFields requires an array.')
    return false
  }

  const cleaned = fields
    .filter(function (f) {
      return typeof f === 'string' && f.trim().length > 0
    })
    .map(function (f) {
      return f.trim().toLowerCase()
    })

  const unique = [...new Set(cleaned)]

  safeWriteJSON(STORAGE_KEY, unique)
  return true
}

/**
 * Adds a single field to the editable fields configuration.
 * Prevents duplicates (case-insensitive).
 *
 * @param {string} field - The field name to add
 * @returns {boolean} true if added, false if already exists or invalid
 */
export function addEditableField(field) {
  if (!field || typeof field !== 'string' || field.trim().length === 0) {
    console.warn('[EditableFieldConfigManager] addEditableField: invalid field name.')
    return false
  }

  const normalized = field.trim().toLowerCase()
  const current = getEditableFields()

  if (current.includes(normalized)) {
    console.warn('[EditableFieldConfigManager] Field "' + normalized + '" already exists in config.')
    return false
  }

  current.push(normalized)
  safeWriteJSON(STORAGE_KEY, current)
  return true
}

/**
 * Removes a single field from the editable fields configuration.
 *
 * @param {string} field - The field name to remove
 * @returns {boolean} true if removed, false if not found or invalid
 */
export function removeEditableField(field) {
  if (!field || typeof field !== 'string' || field.trim().length === 0) {
    console.warn('[EditableFieldConfigManager] removeEditableField: invalid field name.')
    return false
  }

  const normalized = field.trim().toLowerCase()
  const current = getEditableFields()
  const index = current.indexOf(normalized)

  if (index === -1) {
    console.warn('[EditableFieldConfigManager] Field "' + normalized + '" not found in config.')
    return false
  }

  current.splice(index, 1)
  safeWriteJSON(STORAGE_KEY, current)
  return true
}

/**
 * Checks if a specific field is in the editable fields configuration.
 * This does NOT check user role — use AccessControlService.canEdit() for full check.
 *
 * @param {string} fieldName - The field name to check
 * @returns {boolean}
 */
export function isFieldEditable(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') {
    return false
  }

  const normalized = fieldName.trim().toLowerCase()
  const editableFields = getEditableFields()

  return editableFields.includes(normalized)
}

/**
 * Returns the list of all known dashboard fields.
 * Useful for the admin UI to show available fields.
 *
 * @returns {string[]}
 */
export function getKnownFields() {
  return [...KNOWN_FIELDS]
}

/**
 * Returns the default editable fields configuration.
 * Useful for reset functionality.
 *
 * @returns {string[]}
 */
export function getDefaultEditableFields() {
  return [...DEFAULT_EDITABLE_FIELDS]
}

/**
 * Resets the editable fields configuration to defaults.
 *
 * @returns {boolean}
 */
export function resetToDefaults() {
  safeWriteJSON(STORAGE_KEY, DEFAULT_EDITABLE_FIELDS)
  return true
}

const EditableFieldConfigManager = {
  getEditableFields,
  setEditableFields,
  addEditableField,
  removeEditableField,
  isFieldEditable,
  getKnownFields,
  getDefaultEditableFields,
  resetToDefaults,
}

export default EditableFieldConfigManager