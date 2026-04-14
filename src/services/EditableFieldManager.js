import { EditableFieldConfigManager } from './EditableFieldConfigManager.js';
import { AuditLogManager } from './AuditLogManager.js';
import { DashboardService } from './DashboardService.js';
import { AccessControlService } from './AccessControlService.js';

/**
 * Role hierarchy for permission checks.
 * Higher index = more permissions.
 */
const ROLE_HIERARCHY = {
  engineer: 0,
  lead: 1,
  manager: 2,
  admin: 3,
};

/**
 * Minimum role required to edit fields per entity type.
 * Can be overridden by EditableFieldConfigManager.
 */
const DEFAULT_MIN_EDIT_ROLE = {
  readiness: 'lead',
  dsr_domain: 'lead',
  dsr_program: 'lead',
  defects_showstopper: 'lead',
  defects_deferred: 'lead',
  sit_defect_summary: 'lead',
  program_status: 'lead',
  quality_metrics: 'manager',
};

/**
 * Validate that a field value is acceptable for the given field name.
 * @param {string} field
 * @param {*} value
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateFieldValue(field, value) {
  if (value === undefined || value === null) {
    return { valid: false, error: 'Value cannot be null or undefined' };
  }

  switch (field) {
    case 'rag_status': {
      const allowed = ['Green', 'Amber', 'Red'];
      if (!allowed.includes(value)) {
        return { valid: false, error: `RAG status must be one of: ${allowed.join(', ')}` };
      }
      return { valid: true, error: null };
    }
    case 'confidence_index': {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 10) {
        return { valid: false, error: 'Confidence index must be a number between 0 and 10' };
      }
      return { valid: true, error: null };
    }
    case 'comments': {
      if (typeof value !== 'string') {
        return { valid: false, error: 'Comments must be a string' };
      }
      if (value.length > 2000) {
        return { valid: false, error: 'Comments must be 2000 characters or fewer' };
      }
      return { valid: true, error: null };
    }
    case 'test_execution_pass_pct': {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return { valid: false, error: 'Test execution pass percentage must be between 0 and 100' };
      }
      return { valid: true, error: null };
    }
    case 'total_defects':
    case 'open_defects':
    case 'closed_defects':
    case 'deferred_defects': {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return { valid: false, error: `${field} must be a non-negative integer` };
      }
      return { valid: true, error: null };
    }
    default:
      return { valid: true, error: null };
  }
}

/**
 * Check if a role meets the minimum required role level.
 * @param {string} userRole
 * @param {string} minRole
 * @returns {boolean}
 */
function hasMinimumRole(userRole, minRole) {
  const userLevel = ROLE_HIERARCHY[userRole] !== undefined ? ROLE_HIERARCHY[userRole] : -1;
  const minLevel = ROLE_HIERARCHY[minRole] !== undefined ? ROLE_HIERARCHY[minRole] : 999;
  return userLevel >= minLevel;
}

/**
 * Determine if a specific field on a specific entity type is editable
 * for the given user role. Combines admin config + role check.
 *
 * @param {string} entityType - e.g. 'readiness', 'dsr_domain'
 * @param {string} field - e.g. 'rag_status', 'confidence_index'
 * @param {string} userRole - e.g. 'engineer', 'lead', 'manager', 'admin'
 * @returns {boolean}
 */
export function isFieldEditable(entityType, field, userRole) {
  if (!entityType || !field || !userRole) {
    return false;
  }

  try {
    const config = EditableFieldConfigManager.getConfig();

    const entityConfig = config[entityType];
    if (!entityConfig) {
      return false;
    }

    const fieldConfig = entityConfig.fields || entityConfig;

    let fieldIsConfigured = false;
    if (Array.isArray(fieldConfig)) {
      fieldIsConfigured = fieldConfig.includes(field);
    } else if (typeof fieldConfig === 'object' && fieldConfig !== null) {
      fieldIsConfigured = field in fieldConfig;
    }

    if (!fieldIsConfigured) {
      return false;
    }

    let minRole = DEFAULT_MIN_EDIT_ROLE[entityType] || 'lead';

    if (
      typeof fieldConfig === 'object' &&
      !Array.isArray(fieldConfig) &&
      fieldConfig[field] &&
      fieldConfig[field].minRole
    ) {
      minRole = fieldConfig[field].minRole;
    }

    if (entityConfig.minRole) {
      minRole = entityConfig.minRole;
    }

    return hasMinimumRole(userRole, minRole);
  } catch (error) {
    console.error('[EditableFieldManager] Error checking field editability:', error);
    return false;
  }
}

/**
 * Update a field value on a dashboard entity. Validates permission,
 * updates localStorage data via DashboardService, logs an audit entry,
 * and returns the updated record.
 *
 * @param {string} entityType - e.g. 'readiness', 'dsr_domain'
 * @param {string} entityId - e.g. 'WR-12345'
 * @param {string} field - e.g. 'rag_status'
 * @param {*} value - The new value
 * @param {string} userId - The user performing the edit
 * @returns {Promise<object>} The updated record
 */
export async function updateField(entityType, entityId, field, value, userId) {
  if (!entityType || typeof entityType !== 'string') {
    throw new Error('INVALID_INPUT: entityType is required');
  }
  if (!entityId || typeof entityId !== 'string') {
    throw new Error('INVALID_INPUT: entityId is required');
  }
  if (!field || typeof field !== 'string') {
    throw new Error('INVALID_INPUT: field is required');
  }
  if (!userId || typeof userId !== 'string') {
    throw new Error('INVALID_INPUT: userId is required');
  }

  let userRole;
  try {
    userRole = AccessControlService.getUserRole(userId);
  } catch (error) {
    console.error('[EditableFieldManager] Failed to get user role:', error);
    userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';
  }

  if (!isFieldEditable(entityType, field, userRole)) {
    throw new Error('PERMISSION_DENIED: User does not have permission to edit this field');
  }

  const validation = validateFieldValue(field, value);
  if (!validation.valid) {
    throw new Error('INVALID_VALUE: ' + validation.error);
  }

  let existingRecord;
  try {
    existingRecord = DashboardService.getRecord(entityType, entityId);
  } catch (error) {
    console.error('[EditableFieldManager] Failed to get existing record:', error);
    existingRecord = null;
  }

  if (!existingRecord) {
    throw new Error('ENTITY_NOT_FOUND: Record not found for ' + entityType + '/' + entityId);
  }

  const previousValue = existingRecord[field];
  const now = new Date().toISOString();

  let updatedRecord;
  try {
    updatedRecord = DashboardService.updateRecord(entityType, entityId, {
      [field]: value,
      updated_at: now,
      updated_by: userId,
    });
  } catch (error) {
    console.error('[EditableFieldManager] Failed to update record:', error);
    throw new Error('LOCALSTORAGE_ERROR: Failed to persist update');
  }

  try {
    AuditLogManager.logEntry({
      action: 'FIELD_UPDATE',
      entityType,
      entityId,
      field,
      previousValue,
      newValue: value,
      userId,
      userRole,
      timestamp: now,
    });
  } catch (auditError) {
    console.warn('[EditableFieldManager] Audit log failed (non-blocking):', auditError);
  }

  return updatedRecord;
}

/**
 * Get all editable fields for a given entity type and user role.
 * @param {string} entityType
 * @param {string} userRole
 * @returns {Array<string>} List of editable field names
 */
export function getEditableFields(entityType, userRole) {
  if (!entityType || !userRole) {
    return [];
  }

  try {
    const config = EditableFieldConfigManager.getConfig();
    const entityConfig = config[entityType];
    if (!entityConfig) {
      return [];
    }

    const fieldConfig = entityConfig.fields || entityConfig;
    let allFields = [];

    if (Array.isArray(fieldConfig)) {
      allFields = fieldConfig;
    } else if (typeof fieldConfig === 'object' && fieldConfig !== null) {
      allFields = Object.keys(fieldConfig);
    }

    return allFields.filter((f) => isFieldEditable(entityType, f, userRole));
  } catch (error) {
    console.error('[EditableFieldManager] Error getting editable fields:', error);
    return [];
  }
}