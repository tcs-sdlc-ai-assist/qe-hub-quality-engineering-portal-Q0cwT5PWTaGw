import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Settings,
  Shield,
  FileText,
  Upload,
  Link2,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Download,
  Trash2,
  Plus,
  Search,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Edit3,
  Save,
  X,
  Filter,
} from 'lucide-react';
import AccessControlService from '../../services/AccessControlService';
import EditableFieldConfigManager from '../../services/EditableFieldConfigManager';
import AuditLogManager from '../../services/AuditLogManager';
import UploadProcessor from '../../services/UploadProcessor';
import { getQuickLinks, addQuickLink, removeQuickLink, updateQuickLink } from '../../services/quickLinksService';
import { formatDate, formatDateTime } from '../../utils/formatUtils';
import Modal from '../common/Modal';

const TABS = [
  { key: 'fields', label: 'Editable Fields', icon: ToggleRight },
  { key: 'audit', label: 'Audit Log', icon: FileText },
  { key: 'uploads', label: 'Upload History', icon: Upload },
  { key: 'links', label: 'Quick Links', icon: Link2 },
  { key: 'roles', label: 'Role Management', icon: Shield },
];

const AUDIT_PAGE_SIZE = 20;

function TabButton({ tabKey, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(tabKey)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
        active
          ? 'bg-brand-600 text-white shadow-soft'
          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
      }`}
      aria-selected={active}
      role="tab"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

TabButton.propTypes = {
  tabKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

function EditableFieldsPanel() {
  const [fields, setFields] = useState([]);
  const [allFields, setAllFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const loadFields = useCallback(() => {
    const editableFields = EditableFieldConfigManager.getEditableFields();
    setFields(editableFields);

    const knownFields = [
      { name: 'rag_status', label: 'RAG Status', category: 'Release Readiness' },
      { name: 'test_progress', label: 'Test Progress', category: 'Release Readiness' },
      { name: 'defect_count', label: 'Defect Count', category: 'Release Readiness' },
      { name: 'automation_coverage', label: 'Automation Coverage', category: 'Release Readiness' },
      { name: 'environment_status', label: 'Environment Status', category: 'Release Readiness' },
      { name: 'blocker_count', label: 'Blocker Count', category: 'Release Readiness' },
      { name: 'sign_off_status', label: 'Sign-Off Status', category: 'Release Readiness' },
      { name: 'notes', label: 'Notes', category: 'Release Readiness' },
      { name: 'risk_description', label: 'Risk Description', category: 'Risk Register' },
      { name: 'risk_mitigation', label: 'Risk Mitigation', category: 'Risk Register' },
      { name: 'risk_status', label: 'Risk Status', category: 'Risk Register' },
      { name: 'risk_owner', label: 'Risk Owner', category: 'Risk Register' },
      { name: 'program_status', label: 'Program Status', category: 'Program Summary' },
      { name: 'program_notes', label: 'Program Notes', category: 'Program Summary' },
      { name: 'defect_severity', label: 'Defect Severity', category: 'Defect Dashboard' },
      { name: 'defect_priority', label: 'Defect Priority', category: 'Defect Dashboard' },
      { name: 'defect_status', label: 'Defect Status', category: 'Defect Dashboard' },
      { name: 'defect_assignee', label: 'Defect Assignee', category: 'Defect Dashboard' },
      { name: 'sit_status', label: 'SIT Status', category: 'SIT Dashboard' },
      { name: 'sit_notes', label: 'SIT Notes', category: 'SIT Dashboard' },
      { name: 'schedule_status', label: 'Schedule Status', category: 'Schedule' },
      { name: 'schedule_notes', label: 'Schedule Notes', category: 'Schedule' },
    ];
    setAllFields(knownFields);
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const filteredFields = useMemo(() => {
    if (!searchTerm) return allFields;
    const term = searchTerm.toLowerCase();
    return allFields.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.label.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term)
    );
  }, [allFields, searchTerm]);

  const groupedFields = useMemo(() => {
    const groups = {};
    filteredFields.forEach((f) => {
      if (!groups[f.category]) {
        groups[f.category] = [];
      }
      groups[f.category].push(f);
    });
    return groups;
  }, [filteredFields]);

  const handleToggle = useCallback(
    (fieldName) => {
      setSaving(true);
      setMessage(null);
      try {
        if (fields.includes(fieldName)) {
          EditableFieldConfigManager.removeEditableField(fieldName);
        } else {
          EditableFieldConfigManager.addEditableField(fieldName);
        }
        const updated = EditableFieldConfigManager.getEditableFields();
        setFields(updated);
        setMessage({ type: 'success', text: `Field "${fieldName}" updated successfully.` });
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to update field.' });
      } finally {
        setSaving(false);
      }
    },
    [fields]
  );

  const handleEnableAll = useCallback(() => {
    try {
      const allNames = allFields.map((f) => f.name);
      EditableFieldConfigManager.setEditableFields(allNames);
      setFields(allNames);
      setMessage({ type: 'success', text: 'All fields enabled.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to enable all fields.' });
    }
  }, [allFields]);

  const handleDisableAll = useCallback(() => {
    try {
      EditableFieldConfigManager.setEditableFields([]);
      setFields([]);
      setMessage({ type: 'success', text: 'All fields disabled.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to disable all fields.' });
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-surface-900">Editable Fields Configuration</h3>
          <p className="text-sm text-surface-500 mt-1">
            Toggle which fields can be edited by Test Leads and Admins on dashboards.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEnableAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-success-50 text-success-700 hover:bg-success-100 transition-colors"
          >
            Enable All
          </button>
          <button
            onClick={handleDisableAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-danger-50 text-danger-700 hover:bg-danger-100 transition-colors"
          >
            Disable All
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-success-50 text-success-700'
              : 'bg-danger-50 text-danger-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedFields).map(([category, categoryFields]) => (
          <div key={category} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
              <h4 className="text-sm font-semibold text-surface-700">{category}</h4>
            </div>
            <div className="divide-y divide-surface-100">
              {categoryFields.map((field) => {
                const isEnabled = fields.includes(field.name);
                return (
                  <div
                    key={field.name}
                    className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-surface-800">{field.label}</span>
                      <span className="ml-2 text-xs text-surface-400 font-mono">{field.name}</span>
                    </div>
                    <button
                      onClick={() => handleToggle(field.name)}
                      disabled={saving}
                      className="flex items-center gap-1.5 transition-colors"
                      aria-label={`Toggle ${field.label} editability`}
                    >
                      {isEnabled ? (
                        <ToggleRight size={28} className="text-success-500" />
                      ) : (
                        <ToggleLeft size={28} className="text-surface-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(groupedFields).length === 0 && (
          <div className="text-center py-8 text-surface-400 text-sm">
            No fields match your search.
          </div>
        )}
      </div>
    </div>
  );
}

function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const loadLogs = useCallback(() => {
    const auditLogs = AuditLogManager.getAuditLog();
    setLogs(auditLogs);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          (log.field && log.field.toLowerCase().includes(term)) ||
          (log.user && log.user.toLowerCase().includes(term)) ||
          (log.action && log.action.toLowerCase().includes(term))
      );
    }
    if (filterField) {
      result = result.filter((log) => log.field === filterField);
    }
    return result;
  }, [logs, searchTerm, filterField]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / AUDIT_PAGE_SIZE));
  const pagedLogs = filteredLogs.slice(page * AUDIT_PAGE_SIZE, (page + 1) * AUDIT_PAGE_SIZE);

  const uniqueFields = useMemo(() => {
    const fieldSet = new Set(logs.map((l) => l.field).filter(Boolean));
    return Array.from(fieldSet).sort();
  }, [logs]);

  const handleExport = useCallback(() => {
    try {
      const headers = ['Timestamp', 'Action', 'Field', 'Old Value', 'New Value', 'User'];
      const rows = filteredLogs.map((log) => [
        log.timestamp ? new Date(log.timestamp).toISOString() : '—',
        log.action || '—',
        log.field || '—',
        log.oldValue != null ? String(log.oldValue) : '—',
        log.newValue != null ? String(log.newValue) : '—',
        log.user || '—',
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[AdminConfigPanel] Export failed:', err);
    }
  }, [filteredLogs]);

  const handleRotate = useCallback(() => {
    AuditLogManager.rotateLog(500);
    loadLogs();
    setShowRotateConfirm(false);
    setPage(0);
  }, [loadLogs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-surface-900">Audit Log</h3>
          <p className="text-sm text-surface-500 mt-1">
            Track all dashboard edits for compliance and traceability. {logs.length} total entries.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => setShowRotateConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-warning-50 text-warning-700 hover:bg-warning-100 transition-colors"
          >
            <RefreshCw size={14} />
            Rotate Log
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search by field, user, or action..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <select
            value={filterField}
            onChange={(e) => {
              setFilterField(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-8 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white appearance-none"
          >
            <option value="">All Fields</option>
            {uniqueFields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Old Value</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">New Value</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {pagedLogs.map((log, idx) => (
                <tr key={log.timestamp ? `${log.timestamp}-${idx}` : idx} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-2.5 text-surface-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-surface-400" />
                      {log.timestamp ? formatDateTime(log.timestamp) : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.action === 'edit'
                          ? 'bg-brand-50 text-brand-700'
                          : log.action === 'delete'
                          ? 'bg-danger-50 text-danger-700'
                          : 'bg-surface-100 text-surface-600'
                      }`}
                    >
                      {log.action || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-surface-700">{log.field || '—'}</td>
                  <td className="px-4 py-2.5 text-surface-500">{log.oldValue != null ? String(log.oldValue) : '—'}</td>
                  <td className="px-4 py-2.5 text-surface-800 font-medium">{log.newValue != null ? String(log.newValue) : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-surface-600">
                      <User size={13} className="text-surface-400" />
                      {log.user || '—'}
                    </div>
                  </td>
                </tr>
              ))}
              {pagedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-surface-400">
                    No audit log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > AUDIT_PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 bg-surface-50">
            <span className="text-xs text-surface-500">
              Showing {page * AUDIT_PAGE_SIZE + 1}–{Math.min((page + 1) * AUDIT_PAGE_SIZE, filteredLogs.length)} of{' '}
              {filteredLogs.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs rounded-md border border-surface-200 hover:bg-surface-100 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs rounded-md border border-surface-200 hover:bg-surface-100 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showRotateConfirm && (
        <Modal
          isOpen={showRotateConfirm}
          onClose={() => setShowRotateConfirm(false)}
          title="Rotate Audit Log"
          size="sm"
          actions={[
            { label: 'Cancel', variant: 'secondary', onClick: () => setShowRotateConfirm(false) },
            { label: 'Rotate', variant: 'danger', onClick: handleRotate },
          ]}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-surface-600">
              This will keep the most recent 500 entries and remove older entries. This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UploadHistoryPanel() {
  const [lastUpload, setLastUpload] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    const data = UploadProcessor.getLastUpload();
    setLastUpload(data);
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files && e.target.files[0];
    setUploadFile(file || null);
    setUploadResult(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await UploadProcessor.processUpload(uploadFile);
      setUploadResult(result);
      if (result.success) {
        setLastUpload(UploadProcessor.getLastUpload());
        setUploadFile(null);
      }
    } catch (err) {
      setUploadResult({
        success: false,
        rows: [],
        errors: [{ row: 0, field: 'file', error: err.message || 'Upload failed' }],
      });
    } finally {
      setUploading(false);
    }
  }, [uploadFile]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-surface-900">Upload Interim Data</h3>
        <p className="text-sm text-surface-500 mt-1">
          Upload Excel (.xlsx) or CSV files to update dashboard data. Files are validated before processing.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="border-2 border-dashed border-surface-300 rounded-lg p-8 text-center">
          <Upload size={32} className="mx-auto text-surface-400 mb-3" />
          <p className="text-sm text-surface-600 mb-3">
            Drag and drop a file here, or click to browse
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block mx-auto text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 file:cursor-pointer"
          />
          {uploadFile && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-surface-700">
              <FileText size={14} />
              {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!uploadFile || uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload & Validate
              </>
            )}
          </button>
        </div>
      </div>

      {uploadResult && (
        <div
          className={`rounded-xl border p-4 ${
            uploadResult.success
              ? 'bg-success-50 border-success-200'
              : 'bg-danger-50 border-danger-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {uploadResult.success ? (
              <CheckCircle size={18} className="text-success-600" />
            ) : (
              <XCircle size={18} className="text-danger-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                uploadResult.success ? 'text-success-700' : 'text-danger-700'
              }`}
            >
              {uploadResult.success
                ? `Upload successful — ${uploadResult.rows ? uploadResult.rows.length : 0} rows processed.`
                : 'Upload failed with errors.'}
            </span>
          </div>
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {uploadResult.errors.slice(0, 10).map((err, idx) => (
                <li key={idx} className="text-xs text-danger-600 flex items-start gap-1.5">
                  <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                  Row {err.row}: {err.field} — {err.error}
                </li>
              ))}
              {uploadResult.errors.length > 10 && (
                <li className="text-xs text-danger-500">
                  ...and {uploadResult.errors.length - 10} more errors.
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {lastUpload && (
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <h4 className="text-sm font-semibold text-surface-700 mb-2">Last Upload</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-surface-400 text-xs">File</span>
              <p className="text-surface-800 font-medium">{lastUpload.fileName || '—'}</p>
            </div>
            <div>
              <span className="text-surface-400 text-xs">Date</span>
              <p className="text-surface-800 font-medium">
                {lastUpload.timestamp ? formatDate(lastUpload.timestamp) : '—'}
              </p>
            </div>
            <div>
              <span className="text-surface-400 text-xs">Rows</span>
              <p className="text-surface-800 font-medium">
                {lastUpload.rows ? lastUpload.rows.length : 0}
              </p>
            </div>
            <div>
              <span className="text-surface-400 text-xs">Status</span>
              <p className="text-success-600 font-medium">Processed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickLinksPanel() {
  const [links, setLinks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '', category: '' });
  const [message, setMessage] = useState(null);

  const loadLinks = useCallback(() => {
    try {
      const data = getQuickLinks();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[AdminConfigPanel] Failed to load quick links:', err);
      setLinks([]);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleAdd = useCallback(() => {
    if (!formData.title.trim() || !formData.url.trim()) {
      setMessage({ type: 'error', text: 'Title and URL are required.' });
      return;
    }
    try {
      addQuickLink({
        title: formData.title.trim(),
        url: formData.url.trim(),
        category: formData.category.trim() || 'General',
      });
      loadLinks();
      setShowAddModal(false);
      setFormData({ title: '', url: '', category: '' });
      setMessage({ type: 'success', text: 'Quick link added.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add link.' });
    }
  }, [formData, loadLinks]);

  const handleUpdate = useCallback(() => {
    if (!editingLink || !formData.title.trim() || !formData.url.trim()) {
      setMessage({ type: 'error', text: 'Title and URL are required.' });
      return;
    }
    try {
      updateQuickLink(editingLink.id, {
        title: formData.title.trim(),
        url: formData.url.trim(),
        category: formData.category.trim() || 'General',
      });
      loadLinks();
      setEditingLink(null);
      setFormData({ title: '', url: '', category: '' });
      setMessage({ type: 'success', text: 'Quick link updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update link.' });
    }
  }, [editingLink, formData, loadLinks]);

  const handleDelete = useCallback(
    (linkId) => {
      try {
        removeQuickLink(linkId);
        loadLinks();
        setMessage({ type: 'success', text: 'Quick link removed.' });
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to remove link.' });
      }
    },
    [loadLinks]
  );

  const startEdit = useCallback((link) => {
    setEditingLink(link);
    setFormData({ title: link.title || '', url: link.url || '', category: link.category || '' });
    setMessage(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingLink(null);
    setFormData({ title: '', url: '', category: '' });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-surface-900">Quick Links Management</h3>
          <p className="text-sm text-surface-500 mt-1">
            Manage Confluence, Jira, and other quick links displayed on dashboards.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setFormData({ title: '', url: '', category: '' });
            setMessage(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={14} />
          Add Link
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-success-50 text-success-700'
              : 'bg-danger-50 text-danger-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white rounded-xl border border-surface-200 p-4 flex items-center justify-between hover:shadow-card transition-shadow"
          >
            {editingLink && editingLink.id === link.id ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Title"
                  className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="URL"
                  className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Category (optional)"
                  className="w-full px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-success-50 text-success-700 hover:bg-success-100 transition-colors"
                  >
                    <Save size={12} />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Link2 size={16} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{link.title}</p>
                    <p className="text-xs text-surface-400 truncate">{link.url}</p>
                    {link.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-surface-100 text-surface-500">
                        {link.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-brand-600 transition-colors"
                    aria-label={`Open ${link.title}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => startEdit(link)}
                    className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-brand-600 transition-colors"
                    aria-label={`Edit ${link.title}`}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600 transition-colors"
                    aria-label={`Delete ${link.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {links.length === 0 && (
          <div className="text-center py-8 text-surface-400 text-sm bg-white rounded-xl border border-surface-200">
            No quick links configured. Click &quot;Add Link&quot; to get started.
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Quick Link"
          size="sm"
          actions={[
            { label: 'Cancel', variant: 'secondary', onClick: () => setShowAddModal(false) },
            { label: 'Add Link', variant: 'primary', onClick: handleAdd },
          ]}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Confluence - Test Strategy"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Documentation, Tools"
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RoleManagementPanel() {
  const currentRole = AccessControlService.getCurrentRole();

  const roleDescriptions = {
    engineer: {
      label: 'View Only (Engineer)',
      description: 'Can view all dashboards and analytics. Cannot edit any fields or access admin configuration.',
      permissions: ['View dashboards', 'View analytics', 'Export data'],
    },
    lead: {
      label: 'Test Lead',
      description: 'Can view and edit designated fields on dashboards. Cannot access admin configuration.',
      permissions: ['View dashboards', 'View analytics', 'Export data', 'Edit designated fields', 'Add notes'],
    },
    manager: {
      label: 'Admin (Manager)',
      description: 'Full access to all features including admin configuration, field management, and uploads.',
      permissions: [
        'View dashboards',
        'View analytics',
        'Export data',
        'Edit all editable fields',
        'Admin configuration',
        'Upload data',
        'Manage quick links',
        'View audit log',
        'Configure editable fields',
      ],
    },
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-surface-900">Role Management</h3>
        <p className="text-sm text-surface-500 mt-1">
          View role definitions and permissions. Current role:{' '}
          <span className="font-semibold text-brand-600">{roleDescriptions[currentRole]?.label || currentRole}</span>
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(roleDescriptions).map(([role, info]) => {
          const isCurrentRole = role === currentRole;
          return (
            <div
              key={role}
              className={`bg-white rounded-xl border p-5 transition-shadow ${
                isCurrentRole ? 'border-brand-300 shadow-card ring-1 ring-brand-100' : 'border-surface-200 hover:shadow-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-surface-900">{info.label}</h4>
                    {isCurrentRole && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 mt-1">{info.description}</p>
                </div>
                <Shield
                  size={20}
                  className={isCurrentRole ? 'text-brand-500' : 'text-surface-300'}
                />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                  Permissions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {info.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-surface-100 text-surface-600"
                    >
                      <CheckCircle size={10} className="text-success-500" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-50 rounded-xl border border-surface-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-surface-700">Role Assignment</p>
            <p className="text-xs text-surface-500 mt-1">
              Roles are currently configured via the <code className="font-mono bg-surface-200 px-1 py-0.5 rounded text-xs">VITE_DEFAULT_ROLE</code> environment
              variable. In production, roles will be managed through SSO integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminConfigPanel() {
  const [activeTab, setActiveTab] = useState('fields');
  const isAdmin = AccessControlService.isAdmin();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
        <div className="bg-white rounded-xl shadow-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-danger-500" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Access Denied</h2>
          <p className="text-sm text-surface-500">
            You do not have permission to access the Admin Configuration Panel. This area is restricted
            to users with the Admin (Manager) role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <Settings size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-900">Admin Configuration</h1>
          <p className="text-sm text-surface-500">
            Manage editable fields, audit logs, uploads, and quick links.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Admin configuration tabs">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tabKey={tab.key}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.key}
            onClick={setActiveTab}
          />
        ))}
      </div>

      <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200" role="tabpanel">
        {activeTab === 'fields' && <EditableFieldsPanel />}
        {activeTab === 'audit' && <AuditLogPanel />}
        {activeTab === 'uploads' && <UploadHistoryPanel />}
        {activeTab === 'links' && <QuickLinksPanel />}
        {activeTab === 'roles' && <RoleManagementPanel />}
      </div>
    </div>
  );
}