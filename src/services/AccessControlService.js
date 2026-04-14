/**
 * AccessControlService
 *
 * Central role-based access control service for QE Hub.
 * Manages user roles, enforces permissions, and provides
 * role-checking utilities consumed across all components.
 *
 * Roles:
 *   - 'view'     → View-Only (read-only access)
 *   - 'testlead' → Test Lead (can edit permitted fields)
 *   - 'admin'    → Admin (full access, can configure fields/upload)
 *
 * Persistence: localStorage key "user_role"
 *
 * @module AccessControlService
 */

import { getEditableFields } from './EditableFieldConfigManager'

const STORAGE_KEY = 'user_role'

const VALID_ROLES = ['view', 'testlead', 'admin']

const DEFAULT_ROLE = (() => {
  const envRole = import.meta.env.VITE_DEFAULT_ROLE
  if (envRole === 'engineer') return 'view'
  if (envRole === 'lead') return 'testlead'
  if (envRole === 'manager') return 'admin'
  return 'view'
})()

/**
 * Reads a value from localStorage with graceful error handling.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function safeLocalStorageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) {
      return fallback
    }
    return raw
  } catch (err) {
    console.error('[AccessControlService] Failed to read localStorage:', err)
    return fallback
  }
}

/**
 * Writes a value to localStorage with graceful error handling.
 * @param {string} key
 * @param {string} value
 */
function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (err) {
    console.error('[AccessControlService] Failed to write localStorage:', err)
  }
}

/**
 * Returns the current user role from localStorage.
 * Falls back to the default role derived from VITE_DEFAULT_ROLE env var.
 *
 * @returns {'view' | 'testlead' | 'admin'}
 */
export function getCurrentRole() {
  const stored = safeLocalStorageGet(STORAGE_KEY, null)
  if (stored && VALID_ROLES.includes(stored)) {
    return stored
  }
  return DEFAULT_ROLE
}

/**
 * Sets the current user role and persists to localStorage.
 * Validates that the role is one of the allowed values.
 *
 * @param {'view' | 'testlead' | 'admin'} role
 * @returns {boolean} true if role was set successfully, false otherwise
 */
export function setCurrentRole(role) {
  if (!role || !VALID_ROLES.includes(role)) {
    console.warn('[AccessControlService] Invalid role:', role)
    return false
  }
  safeLocalStorageSet(STORAGE_KEY, role)
  return true
}

/**
 * Checks whether the current user can edit a specific field.
 * View-Only users cannot edit anything.
 * Test Leads and Admins can edit fields that are in the editable fields config.
 *
 * @param {string} fieldName - The field name to check editability for
 * @returns {boolean}
 */
export function canEdit(fieldName) {
  const role = getCurrentRole()

  if (role === 'view') {
    return false
  }

  if (!fieldName || typeof fieldName !== 'string') {
    return false
  }

  const editableFields = getEditableFields()
  const normalizedField = fieldName.toLowerCase().trim()
  const normalizedEditable = editableFields.map(function (f) {
    return f.toLowerCase().trim()
  })

  return normalizedEditable.includes(normalizedField)
}

/**
 * Checks if the current user has the Admin role.
 *
 * @returns {boolean}
 */
export function isAdmin() {
  return getCurrentRole() === 'admin'
}

/**
 * Checks if the current user has the Test Lead role.
 *
 * @returns {boolean}
 */
export function isTestLead() {
  return getCurrentRole() === 'testlead'
}

/**
 * Checks if the current user is View-Only.
 *
 * @returns {boolean}
 */
export function isViewOnly() {
  return getCurrentRole() === 'view'
}

/**
 * Generic permission check. Supports the following permission strings:
 *   - 'edit'          → can the user edit any field (testlead or admin)
 *   - 'edit:<field>'  → can the user edit a specific field
 *   - 'admin'         → is the user an admin
 *   - 'upload'        → can the user upload data (admin only)
 *   - 'configure'     → can the user configure editable fields (admin only)
 *   - 'view_audit'    → can the user view audit logs (testlead or admin)
 *
 * @param {string} permission - The permission string to check
 * @returns {boolean}
 */
export function hasPermission(permission) {
  if (!permission || typeof permission !== 'string') {
    return false
  }

  const role = getCurrentRole()

  if (permission === 'admin') {
    return role === 'admin'
  }

  if (permission === 'upload' || permission === 'configure') {
    return role === 'admin'
  }

  if (permission === 'view_audit') {
    return role === 'admin' || role === 'testlead'
  }

  if (permission === 'edit') {
    return role === 'admin' || role === 'testlead'
  }

  if (permission.startsWith('edit:')) {
    const fieldName = permission.substring(5)
    return canEdit(fieldName)
  }

  return false
}

/**
 * Returns the list of all valid roles.
 *
 * @returns {string[]}
 */
export function getValidRoles() {
  return [...VALID_ROLES]
}

/**
 * Returns a human-readable label for a role.
 *
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  switch (role) {
    case 'view':
      return 'View Only'
    case 'testlead':
      return 'Test Lead'
    case 'admin':
      return 'Admin'
    default:
      return 'Unknown'
  }
}

const AccessControlService = {
  getCurrentRole,
  setCurrentRole,
  canEdit,
  isAdmin,
  isTestLead,
  isViewOnly,
  hasPermission,
  getValidRoles,
  getRoleLabel,
}

export default AccessControlService