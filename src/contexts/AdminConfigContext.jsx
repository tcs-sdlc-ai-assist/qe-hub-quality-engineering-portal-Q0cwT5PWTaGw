import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { ROLES } from '../constants/constants';
import { getQuickLinks, saveQuickLinks, addQuickLink, removeQuickLink, updateQuickLink } from '../services/quickLinksService';
import { getItem, setItem } from '../utils/storageUtils';

const AdminConfigContext = createContext(null);

const STORAGE_KEY_EDITABLE_FIELDS = 'qe_hub_editable_fields_config';
const STORAGE_KEY_UPLOAD_HISTORY = 'qe_hub_upload_history';
const STORAGE_KEY_AUDIT_LOGS = 'qe_hub_audit_logs';

/**
 * Default editable field configuration.
 * Defines which fields are editable, their types, and allowed roles.
 */
const DEFAULT_EDITABLE_FIELDS = {
  rag_status: {
    editable: true,
    type: 'select',
    options: ['Green', 'Amber', 'Red'],
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  confidence_index: {
    editable: true,
    type: 'number',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  comments: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  sit_signoff_date: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  brd_dou_date: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  trd_date: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  code_drop_date: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  tdm_request_number: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  dependencies: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  risks: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  performance_testing: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  perf_signoff_date: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  dast_testing: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  dast_signoff_date: {
    editable: true,
    type: 'text',
    allowedRoles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
};

/**
 * Loads editable fields config from localStorage or returns defaults.
 * @returns {Object}
 */
function loadEditableFields() {
  const stored = getItem(STORAGE_KEY_EDITABLE_FIELDS);
  if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
    return stored;
  }
  return { ...DEFAULT_EDITABLE_FIELDS };
}

/**
 * Loads upload history from localStorage.
 * @returns {Array}
 */
function loadUploadHistory() {
  const stored = getItem(STORAGE_KEY_UPLOAD_HISTORY);
  if (Array.isArray(stored)) {
    return stored;
  }
  return [];
}

/**
 * Loads audit logs from localStorage.
 * @returns {Array}
 */
function loadAuditLogs() {
  const stored = getItem(STORAGE_KEY_AUDIT_LOGS);
  if (Array.isArray(stored)) {
    return stored;
  }
  return [];
}

/**
 * AdminConfigProvider wraps the application and provides admin configuration state
 * including editable field configs, quick links, upload history, and audit logs.
 */
export function AdminConfigProvider({ children }) {
  const { currentUser, isAdmin, canEdit } = useAuth();

  const [editableFields, setEditableFields] = useState(loadEditableFields);
  const [quickLinks, setQuickLinks] = useState([]);
  const [uploadHistory, setUploadHistory] = useState(loadUploadHistory);
  const [auditLogs, setAuditLogs] = useState(loadAuditLogs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const links = getQuickLinks();
      setQuickLinks(Array.isArray(links) ? links : []);
    } catch (err) {
      setQuickLinks([]);
    }
  }, []);

  /**
   * Persists editable fields config to localStorage.
   * @param {Object} fields
   */
  const persistEditableFields = useCallback((fields) => {
    setItem(STORAGE_KEY_EDITABLE_FIELDS, fields);
  }, []);

  /**
   * Persists upload history to localStorage.
   * @param {Array} history
   */
  const persistUploadHistory = useCallback((history) => {
    setItem(STORAGE_KEY_UPLOAD_HISTORY, history);
  }, []);

  /**
   * Persists audit logs to localStorage.
   * @param {Array} logs
   */
  const persistAuditLogs = useCallback((logs) => {
    setItem(STORAGE_KEY_AUDIT_LOGS, logs);
  }, []);

  /**
   * Adds an entry to the audit log.
   * @param {{ action: string, field?: string, oldValue?: any, newValue?: any, details?: string }} entry
   */
  const addAuditEntry = useCallback((entry) => {
    const logEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      userRole: currentUser.role,
      action: entry.action || 'unknown',
      field: entry.field || '',
      oldValue: entry.oldValue !== undefined ? String(entry.oldValue) : '',
      newValue: entry.newValue !== undefined ? String(entry.newValue) : '',
      details: entry.details || '',
    };
    setAuditLogs((prev) => {
      const updated = [logEntry, ...prev];
      persistAuditLogs(updated);
      return updated;
    });
  }, [currentUser.name, currentUser.role, persistAuditLogs]);

  /**
   * Updates the editable field configuration for a specific field.
   * Only admins can modify field configs.
   * @param {string} fieldName
   * @param {Object} config
   * @returns {boolean} success
   */
  const updateFieldConfig = useCallback((fieldName, config) => {
    if (!isAdmin()) {
      return false;
    }
    setEditableFields((prev) => {
      const updated = {
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          ...config,
        },
      };
      persistEditableFields(updated);
      addAuditEntry({
        action: 'config',
        field: fieldName,
        oldValue: JSON.stringify(prev[fieldName] || {}),
        newValue: JSON.stringify(updated[fieldName]),
        details: `Updated field config for ${fieldName}`,
      });
      return updated;
    });
    return true;
  }, [isAdmin, persistEditableFields, addAuditEntry]);

  /**
   * Resets editable fields to default configuration.
   * Only admins can reset.
   * @returns {boolean} success
   */
  const resetFieldConfigs = useCallback(() => {
    if (!isAdmin()) {
      return false;
    }
    const defaults = { ...DEFAULT_EDITABLE_FIELDS };
    setEditableFields(defaults);
    persistEditableFields(defaults);
    addAuditEntry({
      action: 'config',
      field: 'all_fields',
      details: 'Reset all editable field configs to defaults',
    });
    return true;
  }, [isAdmin, persistEditableFields, addAuditEntry]);

  /**
   * Gets the field config for a specific field.
   * @param {string} fieldName
   * @returns {Object|null}
   */
  const getFieldConfig = useCallback((fieldName) => {
    return editableFields[fieldName] || null;
  }, [editableFields]);

  /**
   * Checks if a field is editable by the current user.
   * @param {string} fieldName
   * @returns {boolean}
   */
  const isFieldEditable = useCallback((fieldName) => {
    const config = editableFields[fieldName];
    if (!config || !config.editable) {
      return false;
    }
    if (Array.isArray(config.allowedRoles) && !config.allowedRoles.includes(currentUser.role)) {
      return false;
    }
    return true;
  }, [editableFields, currentUser.role]);

  /**
   * Adds a new quick link. Only admins can add.
   * @param {{ title: string, url: string, icon?: string, category?: string, description?: string }} linkData
   * @returns {boolean} success
   */
  const addLink = useCallback((linkData) => {
    if (!isAdmin()) {
      return false;
    }
    try {
      const newLink = addQuickLink(linkData);
      setQuickLinks((prev) => [...prev, newLink]);
      addAuditEntry({
        action: 'create',
        field: 'quick_links',
        newValue: linkData.title,
        details: `Added quick link: ${linkData.title}`,
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [isAdmin, addAuditEntry]);

  /**
   * Removes a quick link by ID. Only admins can remove.
   * @param {string} linkId
   * @returns {boolean} success
   */
  const removeLink = useCallback((linkId) => {
    if (!isAdmin()) {
      return false;
    }
    try {
      const existing = quickLinks.find((l) => l.id === linkId);
      removeQuickLink(linkId);
      setQuickLinks((prev) => prev.filter((l) => l.id !== linkId));
      addAuditEntry({
        action: 'delete',
        field: 'quick_links',
        oldValue: existing ? existing.title : linkId,
        details: `Removed quick link: ${existing ? existing.title : linkId}`,
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [isAdmin, quickLinks, addAuditEntry]);

  /**
   * Updates an existing quick link. Only admins can update.
   * @param {string} linkId
   * @param {Object} updates
   * @returns {boolean} success
   */
  const editLink = useCallback((linkId, updates) => {
    if (!isAdmin()) {
      return false;
    }
    try {
      const updated = updateQuickLink(linkId, updates);
      setQuickLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, ...updated } : l)));
      addAuditEntry({
        action: 'edit',
        field: 'quick_links',
        newValue: updates.title || linkId,
        details: `Updated quick link: ${linkId}`,
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [isAdmin, addAuditEntry]);

  /**
   * Refreshes quick links from the service.
   */
  const refreshQuickLinks = useCallback(() => {
    try {
      const links = getQuickLinks();
      setQuickLinks(Array.isArray(links) ? links : []);
    } catch (err) {
      setQuickLinks([]);
    }
  }, []);

  /**
   * Records an upload in the upload history.
   * @param {{ fileName: string, dataType: string, recordCount: number, status: string }} uploadEntry
   */
  const recordUpload = useCallback((uploadEntry) => {
    const entry = {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      userRole: currentUser.role,
      fileName: uploadEntry.fileName || 'unknown',
      dataType: uploadEntry.dataType || 'unknown',
      recordCount: uploadEntry.recordCount || 0,
      status: uploadEntry.status || 'success',
    };
    setUploadHistory((prev) => {
      const updated = [entry, ...prev];
      persistUploadHistory(updated);
      return updated;
    });
    addAuditEntry({
      action: 'upload',
      field: uploadEntry.dataType,
      newValue: uploadEntry.fileName,
      details: `Uploaded ${uploadEntry.recordCount} records for ${uploadEntry.dataType}`,
    });
  }, [currentUser.name, currentUser.role, persistUploadHistory, addAuditEntry]);

  /**
   * Clears the upload history. Only admins can clear.
   * @returns {boolean} success
   */
  const clearUploadHistory = useCallback(() => {
    if (!isAdmin()) {
      return false;
    }
    setUploadHistory([]);
    persistUploadHistory([]);
    addAuditEntry({
      action: 'delete',
      field: 'upload_history',
      details: 'Cleared all upload history',
    });
    return true;
  }, [isAdmin, persistUploadHistory, addAuditEntry]);

  /**
   * Clears the audit logs. Only admins can clear.
   * @returns {boolean} success
   */
  const clearAuditLogs = useCallback(() => {
    if (!isAdmin()) {
      return false;
    }
    setAuditLogs([]);
    persistAuditLogs([]);
    return true;
  }, [isAdmin, persistAuditLogs]);

  /**
   * Refreshes all admin config data from localStorage.
   */
  const refreshAll = useCallback(() => {
    setLoading(true);
    try {
      setEditableFields(loadEditableFields());
      setUploadHistory(loadUploadHistory());
      setAuditLogs(loadAuditLogs());
      refreshQuickLinks();
    } finally {
      setLoading(false);
    }
  }, [refreshQuickLinks]);

  /**
   * Checks if the current user has permission for a specific admin action.
   * @param {string} action - 'config' | 'upload' | 'audit' | 'links'
   * @returns {boolean}
   */
  const hasPermission = useCallback((action) => {
    switch (action) {
      case 'config':
        return isAdmin();
      case 'upload':
        return canEdit();
      case 'audit':
        return isAdmin();
      case 'links':
        return isAdmin();
      default:
        return false;
    }
  }, [isAdmin, canEdit]);

  const value = useMemo(() => ({
    editableFields,
    quickLinks,
    uploadHistory,
    auditLogs,
    loading,
    updateFieldConfig,
    resetFieldConfigs,
    getFieldConfig,
    isFieldEditable,
    addLink,
    removeLink,
    editLink,
    refreshQuickLinks,
    recordUpload,
    clearUploadHistory,
    addAuditEntry,
    clearAuditLogs,
    refreshAll,
    hasPermission,
  }), [
    editableFields,
    quickLinks,
    uploadHistory,
    auditLogs,
    loading,
    updateFieldConfig,
    resetFieldConfigs,
    getFieldConfig,
    isFieldEditable,
    addLink,
    removeLink,
    editLink,
    refreshQuickLinks,
    recordUpload,
    clearUploadHistory,
    addAuditEntry,
    clearAuditLogs,
    refreshAll,
    hasPermission,
  ]);

  return (
    <AdminConfigContext.Provider value={value}>
      {children}
    </AdminConfigContext.Provider>
  );
}

AdminConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access admin configuration context.
 * Must be used within an AdminConfigProvider (which must be inside an AuthProvider).
 * @returns {Object} Admin config state and methods
 */
export function useAdminConfig() {
  const context = useContext(AdminConfigContext);
  if (context === null) {
    throw new Error('useAdminConfig must be used within an AdminConfigProvider');
  }
  return context;
}

export default AdminConfigContext;