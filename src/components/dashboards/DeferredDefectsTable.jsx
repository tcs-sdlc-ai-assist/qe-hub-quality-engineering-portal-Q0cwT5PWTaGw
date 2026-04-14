import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../common/DataTable.jsx';
import FilterBar from '../common/FilterBar.jsx';
import RAGStatusBadge from '../common/RAGStatusBadge.jsx';
import { DashboardService } from '../../services/DashboardService.js';
import { EditableFieldConfigManager } from '../../services/EditableFieldConfigManager.js';
import { formatDate } from '../../utils/formatUtils.js';
import { ROLES } from '../../constants/constants.js';
import { AlertTriangle, Download } from 'lucide-react';

const dashboardService = new DashboardService();

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

/**
 * DeferredDefectsTable - Renders a table of deferred defects with editable deferral comments.
 * Fetches data via DashboardService and supports filtering by priority, application, and environment.
 * @param {object} props
 * @param {object} props.filters - External filters to apply (release, program, domain)
 * @param {Function} props.onExport - Optional callback for exporting data
 */
export default function DeferredDefectsTable({ filters: externalFilters, onExport }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localFilters, setLocalFilters] = useState({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const combinedFilters = { ...externalFilters, ...localFilters };
      const result = await dashboardService.getDeferredDefects(combinedFilters);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch deferred defects');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [externalFilters, localFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const editableColumns = useMemo(() => {
    const canEdit = userRole === 'manager' || userRole === 'lead';
    if (!canEdit) return [];

    try {
      const config = EditableFieldConfigManager.getFieldConfig('deferred_defects', 'deferral_comment');
      if (config && config.editable) {
        const allowedRoles = config.allowedRoles || [ROLES.ADMIN, ROLES.TEST_LEAD];
        if (allowedRoles.includes(userRole)) {
          return ['deferral_comment'];
        }
      }
    } catch (_e) {
      // If config not available, fall back to role check
    }

    return canEdit ? ['deferral_comment'] : [];
  }, []);

  const handleCellEdit = useCallback(({ rowId, fieldName, value }) => {
    setData((prev) =>
      prev.map((row) => {
        const id = row.id || row.issue_id;
        if (id === rowId) {
          return { ...row, [fieldName]: value };
        }
        return row;
      })
    );
  }, []);

  const priorityOptions = useMemo(() => {
    const priorities = [...new Set(data.map((d) => d.priority).filter(Boolean))];
    return priorities.map((p) => ({ label: p, value: p }));
  }, [data]);

  const applicationOptions = useMemo(() => {
    const apps = [...new Set(data.map((d) => d.impacted_application).filter(Boolean))];
    return apps.map((a) => ({ label: a, value: a }));
  }, [data]);

  const environmentOptions = useMemo(() => {
    const envs = [...new Set(data.map((d) => d.environment).filter(Boolean))];
    return envs.map((e) => ({ label: e, value: e }));
  }, [data]);

  const filterConfig = useMemo(
    () => [
      {
        name: 'priority',
        label: 'Priority',
        defaultValue: '',
        options: [{ label: 'All Priorities', value: '' }, ...priorityOptions],
      },
      {
        name: 'impacted_application',
        label: 'Application',
        defaultValue: '',
        options: [{ label: 'All Applications', value: '' }, ...applicationOptions],
      },
      {
        name: 'environment',
        label: 'Environment',
        defaultValue: '',
        options: [{ label: 'All Environments', value: '' }, ...environmentOptions],
      },
    ],
    [priorityOptions, applicationOptions, environmentOptions]
  );

  const handleFilterChange = useCallback((newFilters) => {
    setLocalFilters(newFilters);
  }, []);

  const filteredData = useMemo(() => {
    let result = data;
    if (localFilters.priority) {
      result = result.filter((d) => d.priority === localFilters.priority);
    }
    if (localFilters.impacted_application) {
      result = result.filter((d) => d.impacted_application === localFilters.impacted_application);
    }
    if (localFilters.environment) {
      result = result.filter((d) => d.environment === localFilters.environment);
    }
    return result;
  }, [data, localFilters]);

  const columns = useMemo(
    () => [
      {
        key: 'issue_id',
        header: 'Issue ID',
        sortable: true,
        width: '110px',
        render: (value) => (
          <span className="font-mono text-sm text-brand-600 font-medium">{value || '—'}</span>
        ),
      },
      {
        key: 'summary',
        header: 'Summary',
        sortable: true,
        width: '200px',
        render: (value) => (
          <span className="text-sm text-surface-800 truncate block max-w-[200px]" title={value}>
            {value || '—'}
          </span>
        ),
      },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        width: '90px',
        render: (value) => {
          const colorMap = {
            P1: 'bg-danger-100 text-danger-700',
            P2: 'bg-warning-100 text-warning-700',
            P3: 'bg-brand-100 text-brand-700',
            P4: 'bg-surface-100 text-surface-700',
          };
          const cls = colorMap[value] || 'bg-surface-100 text-surface-600';
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
              {value || '—'}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        width: '100px',
        render: (value) => {
          if (!value) return <span className="text-sm text-surface-500">—</span>;
          const normalized = value.toLowerCase().replace(/\s+/g, '_');
          if (normalized === 'deferred') {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-700">
                {value}
              </span>
            );
          }
          return <span className="text-sm text-surface-700">{value}</span>;
        },
      },
      {
        key: 'fix_release',
        header: 'Fix Release',
        sortable: true,
        width: '120px',
        render: (value) => <span className="text-sm text-surface-700">{value || '—'}</span>,
      },
      {
        key: 'affect_release',
        header: 'Affect Release',
        sortable: true,
        width: '120px',
        render: (value) => <span className="text-sm text-surface-700">{value || '—'}</span>,
      },
      {
        key: 'impacted_application',
        header: 'Impacted Application',
        sortable: true,
        width: '160px',
        render: (value) => <span className="text-sm text-surface-700">{value || '—'}</span>,
      },
      {
        key: 'created_date',
        header: 'Created Date',
        sortable: true,
        width: '110px',
        render: (value) => <span className="text-sm text-surface-600">{formatDate(value)}</span>,
      },
      {
        key: 'assignee',
        header: 'Assignee',
        sortable: true,
        width: '120px',
        render: (value) => <span className="text-sm text-surface-700">{value || '—'}</span>,
      },
      {
        key: 'wr_number',
        header: 'WR#',
        sortable: true,
        width: '100px',
        render: (value) => (
          <span className="font-mono text-sm text-surface-700">{value || '—'}</span>
        ),
      },
      {
        key: 'wr_description',
        header: 'WR Description',
        sortable: false,
        width: '180px',
        render: (value) => (
          <span className="text-sm text-surface-600 truncate block max-w-[180px]" title={value}>
            {value || '—'}
          </span>
        ),
      },
      {
        key: 'environment',
        header: 'Environment',
        sortable: true,
        width: '110px',
        render: (value) => <span className="text-sm text-surface-700">{value || '—'}</span>,
      },
      {
        key: 'deferral_comment',
        header: 'Deferral Comment',
        sortable: false,
        width: '220px',
        render: (value) => (
          <span className="text-sm text-surface-700 truncate block max-w-[220px]" title={value}>
            {value || '—'}
          </span>
        ),
      },
    ],
    []
  );

  const getRowId = useCallback((row) => row.id || row.issue_id, []);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(filteredData);
    }
  }, [onExport, filteredData]);

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-danger-500 mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Deferred Defects</h3>
          <p className="text-sm text-surface-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card animate-fade-in">
      <div className="px-6 pt-6 pb-4 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">Deferred Defects</h2>
            <p className="text-sm text-surface-500 mt-1">
              {filteredData.length} deferred defect{filteredData.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {onExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-700 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
        <FilterBar filters={filterConfig} onChange={handleFilterChange} />
      </div>
      <div className="p-6">
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
          paginated
          sortable
          editableColumns={editableColumns}
          onCellEdit={handleCellEdit}
          getRowId={getRowId}
        />
      </div>
    </div>
  );
}

DeferredDefectsTable.propTypes = {
  filters: PropTypes.object,
  onExport: PropTypes.func,
};

DeferredDefectsTable.defaultProps = {
  filters: {},
  onExport: null,
};