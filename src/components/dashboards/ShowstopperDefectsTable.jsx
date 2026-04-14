import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../common/DataTable.jsx';
import FilterBar from '../common/FilterBar.jsx';
import RAGStatusBadge from '../common/RAGStatusBadge.jsx';
import { DashboardService } from '../../services/DashboardService.js';
import { formatDate } from '../../utils/formatUtils.js';
import { getSeverityColor } from '../../utils/formatUtils.js';
import { AlertTriangle, Bug, Download } from 'lucide-react';

const dashboardService = new DashboardService();

/**
 * Calculates aging in days from a given date string to today.
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {number|null} Number of days or null if invalid
 */
function calculateAging(dateStr) {
  if (!dateStr) return null;
  const created = new Date(dateStr);
  if (isNaN(created.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Returns a Tailwind class string for aging badge styling.
 * @param {number|null} days
 * @returns {string}
 */
function getAgingBadgeClass(days) {
  if (days === null || days === undefined) return 'text-surface-500';
  if (days >= 14) return 'text-danger-600 bg-danger-50 font-semibold';
  if (days >= 7) return 'text-warning-600 bg-warning-50 font-medium';
  return 'text-success-600 bg-success-50';
}

/**
 * Returns a Tailwind class string for priority badge styling.
 * @param {string} priority
 * @returns {string}
 */
function getPriorityBadgeClass(priority) {
  const normalized = (priority || '').toUpperCase().trim();
  switch (normalized) {
    case 'P1':
      return 'bg-danger-100 text-danger-700 border border-danger-200';
    case 'P2':
      return 'bg-warning-100 text-warning-700 border border-warning-200';
    case 'P3':
      return 'bg-brand-100 text-brand-700 border border-brand-200';
    case 'P4':
      return 'bg-surface-100 text-surface-600 border border-surface-200';
    default:
      return 'bg-surface-100 text-surface-600 border border-surface-200';
  }
}

/**
 * Returns a Tailwind class string for status badge styling.
 * @param {string} status
 * @returns {string}
 */
function getStatusBadgeClass(status) {
  const normalized = (status || '').toLowerCase().trim().replace(/[\s-]/g, '_');
  switch (normalized) {
    case 'open':
      return 'bg-danger-50 text-danger-700';
    case 'in_progress':
      return 'bg-brand-50 text-brand-700';
    case 'resolved':
      return 'bg-success-50 text-success-700';
    case 'closed':
      return 'bg-surface-100 text-surface-600';
    case 'deferred':
      return 'bg-warning-50 text-warning-700';
    case 'reopened':
      return 'bg-danger-50 text-danger-700';
    default:
      return 'bg-surface-100 text-surface-600';
  }
}

const COLUMNS = [
  {
    key: 'issueId',
    header: 'Issue ID',
    sortable: true,
    width: '120px',
    render: (value) => (
      <span className="font-mono text-sm text-brand-600 font-medium">{value || '—'}</span>
    ),
  },
  {
    key: 'summary',
    header: 'Summary',
    sortable: true,
    width: '220px',
    render: (value) => (
      <span className="text-sm text-surface-800 line-clamp-2" title={value || ''}>
        {value || '—'}
      </span>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    sortable: true,
    width: '80px',
    render: (value) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadgeClass(value)}`}
      >
        {value || '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '110px',
    render: (value) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(value)}`}
      >
        {value || '—'}
      </span>
    ),
  },
  {
    key: 'release',
    header: 'Release',
    sortable: true,
    width: '130px',
  },
  {
    key: 'impactedApplication',
    header: 'Impacted Application',
    sortable: true,
    width: '160px',
  },
  {
    key: 'createdDate',
    header: 'Created Date',
    sortable: true,
    width: '120px',
    render: (value) => (
      <span className="text-sm text-surface-700">{formatDate(value)}</span>
    ),
  },
  {
    key: 'aging',
    header: 'Aging (Days)',
    sortable: true,
    width: '100px',
    render: (value, row) => {
      const days = calculateAging(row.createdDate);
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getAgingBadgeClass(days)}`}
        >
          {days !== null ? `${days}d` : '—'}
        </span>
      );
    },
  },
  {
    key: 'assignee',
    header: 'Assignee',
    sortable: true,
    width: '130px',
    render: (value) => (
      <span className="text-sm text-surface-700">{value || '—'}</span>
    ),
  },
  {
    key: 'wrNumber',
    header: 'WR#',
    sortable: true,
    width: '100px',
    render: (value) => (
      <span className="font-mono text-sm text-surface-700">{value || '—'}</span>
    ),
  },
  {
    key: 'wrDescription',
    header: 'WR Description',
    sortable: false,
    width: '180px',
    render: (value) => (
      <span className="text-sm text-surface-600 line-clamp-2" title={value || ''}>
        {value || '—'}
      </span>
    ),
  },
  {
    key: 'environment',
    header: 'Environment',
    sortable: true,
    width: '110px',
    render: (value) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-100 text-surface-700 text-xs font-medium">
        {value || '—'}
      </span>
    ),
  },
];

/**
 * ShowstopperDefectsTable - Displays showstopper defects in a filterable, sortable DataTable.
 * Fetches data via DashboardService.getShowstopperDefects().
 */
export default function ShowstopperDefectsTable({ filters: externalFilters }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internalFilters, setInternalFilters] = useState({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const combinedFilters = { ...externalFilters, ...internalFilters };
      const result = await dashboardService.getShowstopperDefects(combinedFilters);
      const enriched = (result || []).map((row) => ({
        ...row,
        aging: calculateAging(row.createdDate),
      }));
      setData(enriched);
    } catch (err) {
      console.error('[ShowstopperDefectsTable] Failed to fetch data:', err);
      setError(err.message || 'Failed to load showstopper defects');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [externalFilters, internalFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uniqueValues = useMemo(() => {
    const priorities = [...new Set(data.map((d) => d.priority).filter(Boolean))];
    const statuses = [...new Set(data.map((d) => d.status).filter(Boolean))];
    const releases = [...new Set(data.map((d) => d.release).filter(Boolean))];
    const environments = [...new Set(data.map((d) => d.environment).filter(Boolean))];
    const applications = [...new Set(data.map((d) => d.impactedApplication).filter(Boolean))];

    return {
      priorities: priorities.map((p) => ({ label: p, value: p })),
      statuses: statuses.map((s) => ({ label: s, value: s })),
      releases: releases.map((r) => ({ label: r, value: r })),
      environments: environments.map((e) => ({ label: e, value: e })),
      applications: applications.map((a) => ({ label: a, value: a })),
    };
  }, [data]);

  const filterConfig = useMemo(
    () => [
      {
        name: 'priority',
        label: 'Priority',
        defaultValue: '',
        options: [{ label: 'All Priorities', value: '' }, ...uniqueValues.priorities],
      },
      {
        name: 'status',
        label: 'Status',
        defaultValue: '',
        options: [{ label: 'All Statuses', value: '' }, ...uniqueValues.statuses],
      },
      {
        name: 'release',
        label: 'Release',
        defaultValue: '',
        options: [{ label: 'All Releases', value: '' }, ...uniqueValues.releases],
      },
      {
        name: 'environment',
        label: 'Environment',
        defaultValue: '',
        options: [{ label: 'All Environments', value: '' }, ...uniqueValues.environments],
      },
      {
        name: 'impactedApplication',
        label: 'Application',
        defaultValue: '',
        options: [{ label: 'All Applications', value: '' }, ...uniqueValues.applications],
      },
    ],
    [uniqueValues]
  );

  const handleFilterChange = useCallback((newFilters) => {
    setInternalFilters(newFilters);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (internalFilters.priority && row.priority !== internalFilters.priority) return false;
      if (internalFilters.status && row.status !== internalFilters.status) return false;
      if (internalFilters.release && row.release !== internalFilters.release) return false;
      if (internalFilters.environment && row.environment !== internalFilters.environment) return false;
      if (
        internalFilters.impactedApplication &&
        row.impactedApplication !== internalFilters.impactedApplication
      )
        return false;
      return true;
    });
  }, [data, internalFilters]);

  const summaryStats = useMemo(() => {
    const total = filteredData.length;
    const critical = filteredData.filter(
      (d) => (d.priority || '').toUpperCase() === 'P1'
    ).length;
    const open = filteredData.filter(
      (d) => (d.status || '').toLowerCase() === 'open'
    ).length;
    const avgAging =
      total > 0
        ? Math.round(
            filteredData.reduce((sum, d) => sum + (d.aging || 0), 0) / total
          )
        : 0;

    return { total, critical, open, avgAging };
  }, [filteredData]);

  const getRowId = useCallback((row) => row.issueId || row.id || '', []);

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-danger-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900">Showstopper Defects</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-10 h-10 text-danger-400 mb-3" />
          <p className="text-surface-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card animate-fade-in">
      <div className="p-6 border-b border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-50 rounded-lg">
              <Bug className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900">
                Showstopper Defects
              </h2>
              <p className="text-sm text-surface-500 mt-0.5">
                Critical defects impacting release readiness
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-surface-50 rounded-lg p-3">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold text-surface-900 mt-1">{summaryStats.total}</p>
          </div>
          <div className="bg-danger-50 rounded-lg p-3">
            <p className="text-xs text-danger-600 font-medium uppercase tracking-wide">P1 Critical</p>
            <p className="text-xl font-bold text-danger-700 mt-1">{summaryStats.critical}</p>
          </div>
          <div className="bg-warning-50 rounded-lg p-3">
            <p className="text-xs text-warning-600 font-medium uppercase tracking-wide">Open</p>
            <p className="text-xl font-bold text-warning-700 mt-1">{summaryStats.open}</p>
          </div>
          <div className="bg-brand-50 rounded-lg p-3">
            <p className="text-xs text-brand-600 font-medium uppercase tracking-wide">Avg Aging</p>
            <p className="text-xl font-bold text-brand-700 mt-1">{summaryStats.avgAging}d</p>
          </div>
        </div>

        <FilterBar filters={filterConfig} onChange={handleFilterChange} />
      </div>

      <div className="p-0">
        <DataTable
          columns={COLUMNS}
          data={filteredData}
          loading={loading}
          paginated
          sortable
          getRowId={getRowId}
        />
      </div>
    </div>
  );
}

ShowstopperDefectsTable.propTypes = {
  filters: PropTypes.object,
};

ShowstopperDefectsTable.defaultProps = {
  filters: {},
};