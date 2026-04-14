import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Download, Search, Trash2, ShieldAlert, Filter, X, Clock, User, FileText } from 'lucide-react';
import { getAuditLog, rotateLog } from '../../services/AuditLogManager';
import { isAdmin, getCurrentRole } from '../../services/AccessControlService';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/formatUtils';
import { exportToCSV } from '../../utils/filterUtils';

const STORAGE_KEY_PREFIX = 'qe_hub_';

/**
 * AuditLogViewer - Displays paginated, filterable table of audit log entries.
 * Admin-only access. Supports export to CSV.
 */
export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userRole = getCurrentRole();
  const hasAdminAccess = isAdmin();

  useEffect(() => {
    try {
      const entries = getAuditLog();
      setLogs(Array.isArray(entries) ? entries : []);
    } catch (err) {
      console.error('[AuditLogViewer] Failed to load audit log:', err);
      setLogs([]);
    }
  }, [refreshKey]);

  const uniqueActions = useMemo(() => {
    const actions = [...new Set(logs.map((l) => l.action).filter(Boolean))];
    return actions.sort();
  }, [logs]);

  const uniqueFields = useMemo(() => {
    const fields = [...new Set(logs.map((l) => l.field).filter(Boolean))];
    return fields.sort();
  }, [logs]);

  const uniqueUsers = useMemo(() => {
    const users = [...new Set(logs.map((l) => l.user).filter(Boolean))];
    return users.sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (entry) =>
          (entry.action && entry.action.toLowerCase().includes(term)) ||
          (entry.field && entry.field.toLowerCase().includes(term)) ||
          (entry.user && entry.user.toLowerCase().includes(term)) ||
          (entry.oldValue != null && String(entry.oldValue).toLowerCase().includes(term)) ||
          (entry.newValue != null && String(entry.newValue).toLowerCase().includes(term))
      );
    }

    if (actionFilter) {
      result = result.filter((entry) => entry.action === actionFilter);
    }

    if (fieldFilter) {
      result = result.filter((entry) => entry.field === fieldFilter);
    }

    if (userFilter) {
      result = result.filter((entry) => entry.user === userFilter);
    }

    result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return result;
  }, [logs, searchTerm, actionFilter, fieldFilter, userFilter]);

  const handleExportCSV = useCallback(() => {
    if (filteredLogs.length === 0) return;

    const csvRows = filteredLogs.map((entry) => ({
      Timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : '—',
      User: entry.user || '—',
      Action: entry.action || '—',
      Field: entry.field || '—',
      'Old Value': entry.oldValue != null ? String(entry.oldValue) : '—',
      'New Value': entry.newValue != null ? String(entry.newValue) : '—',
    }));

    try {
      if (typeof exportToCSV === 'function') {
        exportToCSV(csvRows, 'qe_hub_audit_log');
      } else {
        fallbackExportCSV(csvRows);
      }
    } catch (err) {
      console.error('[AuditLogViewer] CSV export failed, using fallback:', err);
      fallbackExportCSV(csvRows);
    }
  }, [filteredLogs]);

  const handleRotateLog = useCallback(() => {
    try {
      rotateLog(500);
      setRefreshKey((k) => k + 1);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('[AuditLogViewer] Failed to rotate audit log:', err);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setActionFilter('');
    setFieldFilter('');
    setUserFilter('');
  }, []);

  const hasActiveFilters = searchTerm || actionFilter || fieldFilter || userFilter;

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Timestamp',
        sortable: true,
        width: '180px',
        render: (value) => {
          if (!value) return <span className="text-surface-400">—</span>;
          const date = new Date(value);
          return (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
              <span className="text-sm text-surface-700 font-mono">
                {formatDate(date.toISOString().split('T')[0])}{' '}
                <span className="text-surface-500">
                  {date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </span>
              </span>
            </div>
          );
        },
      },
      {
        key: 'user',
        header: 'User',
        sortable: true,
        width: '140px',
        render: (value) => {
          if (!value) return <span className="text-surface-400">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
              <span className="text-sm text-surface-700 font-medium">{value}</span>
            </div>
          );
        },
      },
      {
        key: 'action',
        header: 'Action',
        sortable: true,
        width: '120px',
        render: (value) => {
          if (!value) return <span className="text-surface-400">—</span>;
          const colorMap = {
            edit: 'bg-brand-50 text-brand-700',
            create: 'bg-success-50 text-success-700',
            delete: 'bg-danger-50 text-danger-700',
            upload: 'bg-accent-50 text-accent-700',
            config: 'bg-warning-50 text-warning-700',
          };
          const normalized = value.toLowerCase();
          const colorClass = colorMap[normalized] || 'bg-surface-100 text-surface-700';
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
            >
              {value}
            </span>
          );
        },
      },
      {
        key: 'field',
        header: 'Field',
        sortable: true,
        width: '160px',
        render: (value) => {
          if (!value) return <span className="text-surface-400">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
              <span className="text-sm text-surface-600 font-mono">{value}</span>
            </div>
          );
        },
      },
      {
        key: 'oldValue',
        header: 'Old Value',
        sortable: false,
        width: '160px',
        render: (value) => {
          if (value == null || value === '') return <span className="text-surface-400">—</span>;
          return (
            <span className="text-sm text-danger-600 bg-danger-50 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px] inline-block">
              {String(value)}
            </span>
          );
        },
      },
      {
        key: 'newValue',
        header: 'New Value',
        sortable: false,
        width: '160px',
        render: (value) => {
          if (value == null || value === '') return <span className="text-surface-400">—</span>;
          return (
            <span className="text-sm text-success-600 bg-success-50 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px] inline-block">
              {String(value)}
            </span>
          );
        },
      },
    ],
    []
  );

  if (!hasAdminAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="bg-white rounded-xl shadow-card p-8 max-w-md text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-danger-600" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Access Denied</h2>
          <p className="text-sm text-surface-500">
            You need Admin (manager) access to view the audit log. Your current role is{' '}
            <span className="font-medium text-surface-700">{userRole}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Audit Log</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {filteredLogs.length} of {logs.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-white text-danger-600 border border-danger-200 hover:bg-danger-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Rotate Log
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit log..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-lg shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-surface-200 rounded-lg shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-white transition-colors min-w-[140px]"
              aria-label="Filter by action"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Field Filter */}
          <div>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-surface-200 rounded-lg shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-white transition-colors min-w-[140px]"
              aria-label="Filter by field"
            >
              <option value="">All Fields</option>
              {uniqueFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-surface-200 rounded-lg shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none bg-white transition-colors min-w-[140px]"
              aria-label="Filter by user"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredLogs}
          paginated
          sortable
          getRowId={(row) => `audit-${row.timestamp}-${row.field}-${row.user}`}
        />
      </div>

      {/* Rotate Confirmation Modal */}
      {showClearConfirm && (
        <Modal
          title="Rotate Audit Log"
          size="sm"
          onClose={() => setShowClearConfirm(false)}
          actions={[
            {
              label: 'Cancel',
              variant: 'secondary',
              onClick: () => setShowClearConfirm(false),
            },
            {
              label: 'Rotate Log',
              variant: 'danger',
              onClick: handleRotateLog,
            },
          ]}
        >
          <p className="text-sm text-surface-600">
            This will trim the audit log to the most recent 500 entries. Older entries will be
            permanently removed.
          </p>
          <p className="text-sm text-surface-500 mt-2">
            Current log size: <span className="font-medium text-surface-700">{logs.length}</span>{' '}
            entries
          </p>
        </Modal>
      )}
    </div>
  );
}

/**
 * Fallback CSV export using native browser APIs when filterUtils.exportToCSV is unavailable.
 * @param {Array<Object>} rows - Array of row objects to export
 */
function fallbackExportCSV(rows) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] != null ? String(row[h]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'qe_hub_audit_log.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

AuditLogViewer.propTypes = {};