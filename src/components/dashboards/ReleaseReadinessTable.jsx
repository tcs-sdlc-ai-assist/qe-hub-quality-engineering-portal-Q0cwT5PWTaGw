import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../common/DataTable.jsx';
import RAGStatusBadge from '../common/RAGStatusBadge.jsx';
import FilterBar from '../common/FilterBar.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { AlertTriangle } from 'lucide-react';
import DashboardService from '../../services/DashboardService.js';
import { formatPercentage, formatNumber } from '../../utils/formatUtils.js';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

/**
 * Release Readiness Table component
 * Renders a DataTable with release readiness data including editable RAG status,
 * confidence index, and comments columns for authorized roles.
 * @param {object} props
 * @param {object} props.externalFilters - Optional external filter state to apply
 * @param {Function} props.onDataLoad - Optional callback when data is loaded
 */
export default function ReleaseReadinessTable({ externalFilters, onDataLoad }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const dashboardService = useMemo(() => new DashboardService(), []);

  const fetchData = useCallback(async (appliedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const combinedFilters = { ...appliedFilters, ...externalFilters };
      const result = await dashboardService.getReadinessData(combinedFilters);
      const rows = Array.isArray(result) ? result : (result?.data || []);
      setData(rows);
      if (onDataLoad) {
        onDataLoad(rows);
      }
    } catch (err) {
      console.error('[ReleaseReadinessTable] Failed to fetch readiness data:', err);
      setError(err.message || 'Failed to load release readiness data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dashboardService, externalFilters, onDataLoad]);

  useEffect(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  const filterConfig = useMemo(() => {
    const releases = [...new Set(data.map((r) => r.release).filter(Boolean))];
    const programs = [...new Set(data.map((r) => r.program).filter(Boolean))];
    const domains = [...new Set(data.map((r) => r.domain).filter(Boolean))];

    const config = [];

    if (releases.length > 0) {
      config.push({
        name: 'release',
        label: 'Release',
        defaultValue: '',
        options: [
          { label: 'All Releases', value: '' },
          ...releases.map((r) => ({ label: r, value: r })),
        ],
      });
    }

    if (programs.length > 0) {
      config.push({
        name: 'program',
        label: 'Program',
        defaultValue: '',
        options: [
          { label: 'All Programs', value: '' },
          ...programs.map((p) => ({ label: p, value: p })),
        ],
      });
    }

    if (domains.length > 0) {
      config.push({
        name: 'domain',
        label: 'Domain',
        defaultValue: '',
        options: [
          { label: 'All Domains', value: '' },
          ...domains.map((d) => ({ label: d, value: d })),
        ],
      });
    }

    return config;
  }, [data]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.release) {
      result = result.filter((row) => row.release === filters.release);
    }
    if (filters.program) {
      result = result.filter((row) => row.program === filters.program);
    }
    if (filters.domain) {
      result = result.filter((row) => row.domain === filters.domain);
    }

    return result;
  }, [data, filters]);

  const handleCellEdit = useCallback(
    async ({ rowId, field, value, rowData }) => {
      try {
        const updatedData = data.map((row) => {
          const id = row.id || row.wr_number;
          if (id === rowId) {
            return { ...row, [field]: value };
          }
          return row;
        });
        setData(updatedData);
      } catch (err) {
        console.error('[ReleaseReadinessTable] Cell edit failed:', err);
      }
    },
    [data]
  );

  const columns = useMemo(
    () => [
      {
        key: 'release',
        header: 'Release',
        sortable: true,
        width: '140px',
      },
      {
        key: 'program',
        header: 'Program',
        sortable: true,
        width: '160px',
      },
      {
        key: 'wr_number',
        header: 'WR #',
        sortable: true,
        width: '120px',
        render: (value) => (
          <span className="font-mono text-sm text-brand-600 font-medium">
            {value || '—'}
          </span>
        ),
      },
      {
        key: 'rag_status',
        header: 'RAG Status',
        sortable: true,
        width: '130px',
        render: (value) => (
          <RAGStatusBadge status={value || 'Green'} size="sm" />
        ),
      },
      {
        key: 'test_execution_pass_pct',
        header: 'Test Exec Pass %',
        sortable: true,
        width: '150px',
        render: (value) => {
          const formatted = formatPercentage(value);
          let colorClass = 'text-surface-700';
          if (value != null) {
            if (value >= 90) colorClass = 'text-success-600';
            else if (value >= 70) colorClass = 'text-warning-600';
            else colorClass = 'text-danger-600';
          }
          return (
            <span className={`font-medium ${colorClass}`}>{formatted}</span>
          );
        },
      },
      {
        key: 'total_defects',
        header: 'Total Defects',
        sortable: true,
        width: '120px',
        render: (value) => (
          <span className="font-mono text-sm">{formatNumber(value)}</span>
        ),
      },
      {
        key: 'open_defects',
        header: 'Open Defects',
        sortable: true,
        width: '120px',
        render: (value) => {
          const num = typeof value === 'number' ? value : 0;
          const colorClass = num > 0 ? 'text-danger-600 font-semibold' : 'text-success-600';
          return (
            <span className={`font-mono text-sm ${colorClass}`}>
              {formatNumber(value)}
            </span>
          );
        },
      },
      {
        key: 'confidence_index',
        header: 'Confidence Index',
        sortable: true,
        width: '150px',
        render: (value) => {
          if (value == null) return <span className="text-surface-400">—</span>;
          let colorClass = 'text-surface-700';
          if (value >= 8) colorClass = 'text-success-600';
          else if (value >= 5) colorClass = 'text-warning-600';
          else colorClass = 'text-danger-600';
          return (
            <span className={`font-semibold ${colorClass}`}>
              {Number(value).toFixed(1)}
            </span>
          );
        },
      },
      {
        key: 'comments',
        header: 'Comments',
        sortable: false,
        width: '220px',
        render: (value) => (
          <span
            className="text-sm text-surface-600 truncate block max-w-[200px]"
            title={value || ''}
          >
            {value || '—'}
          </span>
        ),
      },
    ],
    []
  );

  const editableColumns = useMemo(() => {
    if (userRole === 'manager' || userRole === 'lead') {
      return ['rag_status', 'confidence_index', 'comments'];
    }
    return [];
  }, []);

  const getRowId = useCallback((row) => row.id || row.wr_number, []);

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger-600" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            Failed to Load Data
          </h3>
          <p className="text-sm text-surface-500 mb-4 max-w-md">{error}</p>
          <button
            onClick={() => fetchData(filters)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">
              Release Readiness
            </h2>
            <p className="text-sm text-surface-500 mt-1">
              Track release readiness across programs and work requests
            </p>
          </div>
          {!loading && (
            <span className="text-xs text-surface-400 bg-surface-100 px-3 py-1 rounded-full">
              {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
            </span>
          )}
        </div>

        {filterConfig.length > 0 && (
          <div className="mb-4">
            <FilterBar filters={filterConfig} onChange={handleFilterChange} />
          </div>
        )}

        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading release readiness data..." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            loading={false}
            paginated
            sortable
            editableColumns={editableColumns}
            onCellEdit={handleCellEdit}
            getRowId={getRowId}
          />
        )}
      </div>
    </div>
  );
}

ReleaseReadinessTable.propTypes = {
  externalFilters: PropTypes.object,
  onDataLoad: PropTypes.func,
};

ReleaseReadinessTable.defaultProps = {
  externalFilters: {},
  onDataLoad: null,
};