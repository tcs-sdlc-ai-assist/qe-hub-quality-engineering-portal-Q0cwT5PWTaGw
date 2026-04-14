import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, BarChart3, Table2, RefreshCw } from 'lucide-react';
import ChartCard from '../common/ChartCard';
import DataTable from '../common/DataTable';
import FilterBar from '../common/FilterBar';
import LoadingSpinner from '../common/LoadingSpinner';
import RAGStatusBadge from '../common/RAGStatusBadge';
import DashboardService from '../../services/DashboardService';
import { DOMAINS, DEFECT_SEVERITIES, DEFECT_STATUSES } from '../../constants/constants';
import { formatNumber, formatPercentage } from '../../utils/formatUtils';
import { getSeverityColor } from '../../utils/formatUtils';

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

const STATUS_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4'];

/**
 * SIT Defect Summary component
 * Renders bar charts (defects by Domain grouped by Severity) and summary tables
 * (defect status breakdown, severity breakdown) for upcoming 2 releases.
 */
export default function SITDefectSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('charts');

  const dashboardService = useMemo(() => new DashboardService(), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getSITDefectSummary(filters);
      setRawData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[SITDefectSummary] Failed to fetch data:', err);
      setError(err.message || 'Failed to load SIT defect summary');
    } finally {
      setLoading(false);
    }
  }, [dashboardService, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Derive unique releases from data
  const releases = useMemo(() => {
    const releaseSet = new Set();
    rawData.forEach((item) => {
      if (item.release) releaseSet.add(item.release);
    });
    return Array.from(releaseSet).sort().slice(0, 2);
  }, [rawData]);

  // Filter config
  const filterConfig = useMemo(() => {
    const domainOptions = (DOMAINS || []).map((d) => ({
      label: typeof d === 'string' ? d : d.label || d.value,
      value: typeof d === 'string' ? d : d.value,
    }));

    const releaseOptions = releases.map((r) => ({ label: r, value: r }));

    const severityOptions = (DEFECT_SEVERITIES || ['Critical', 'High', 'Medium', 'Low']).map((s) => ({
      label: typeof s === 'string' ? s : s.label || s.value,
      value: typeof s === 'string' ? s : s.value,
    }));

    return [
      { name: 'release', label: 'Release', defaultValue: '', options: [{ label: 'All Releases', value: '' }, ...releaseOptions] },
      { name: 'domain', label: 'Domain', defaultValue: '', options: [{ label: 'All Domains', value: '' }, ...domainOptions] },
      { name: 'severity', label: 'Severity', defaultValue: '', options: [{ label: 'All Severities', value: '' }, ...severityOptions] },
    ];
  }, [releases]);

  // Apply local filters to raw data
  const filteredData = useMemo(() => {
    let data = [...rawData];
    if (filters.release) {
      data = data.filter((d) => d.release === filters.release);
    }
    if (filters.domain) {
      data = data.filter((d) => d.domain === filters.domain);
    }
    if (filters.severity) {
      data = data.filter((d) => d.severity === filters.severity);
    }
    return data;
  }, [rawData, filters]);

  // Build chart data: defects by Domain grouped by Severity
  const domainSeverityChartData = useMemo(() => {
    const domainMap = {};
    filteredData.forEach((item) => {
      const domain = item.domain || 'Unknown';
      const severity = item.severity || 'Unknown';
      const count = item.defect_count || item.count || 1;

      if (!domainMap[domain]) {
        domainMap[domain] = { name: domain };
      }
      domainMap[domain][severity] = (domainMap[domain][severity] || 0) + count;
    });
    return Object.values(domainMap);
  }, [filteredData]);

  // Build per-release chart data
  const releaseChartData = useMemo(() => {
    return releases.map((release) => {
      const releaseItems = filteredData.filter((d) => d.release === release);
      const domainMap = {};
      releaseItems.forEach((item) => {
        const domain = item.domain || 'Unknown';
        const severity = item.severity || 'Unknown';
        const count = item.defect_count || item.count || 1;

        if (!domainMap[domain]) {
          domainMap[domain] = { name: domain };
        }
        domainMap[domain][severity] = (domainMap[domain][severity] || 0) + count;
      });
      return {
        release,
        data: Object.values(domainMap),
      };
    });
  }, [filteredData, releases]);

  // Severity breakdown table data
  const severityBreakdown = useMemo(() => {
    const severityMap = {};
    filteredData.forEach((item) => {
      const severity = item.severity || 'Unknown';
      const count = item.defect_count || item.count || 1;
      if (!severityMap[severity]) {
        severityMap[severity] = { severity, total: 0, open: 0, closed: 0, inProgress: 0 };
      }
      severityMap[severity].total += count;
      const status = (item.status || '').toLowerCase();
      if (status === 'open' || status === 'reopened') {
        severityMap[severity].open += count;
      } else if (status === 'closed' || status === 'resolved') {
        severityMap[severity].closed += count;
      } else if (status === 'in progress') {
        severityMap[severity].inProgress += count;
      }
    });
    return Object.values(severityMap).sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3, Unknown: 4 };
      return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
    });
  }, [filteredData]);

  // Status breakdown table data
  const statusBreakdown = useMemo(() => {
    const statusMap = {};
    filteredData.forEach((item) => {
      const status = item.status || 'Unknown';
      const count = item.defect_count || item.count || 1;
      if (!statusMap[status]) {
        statusMap[status] = { status, total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      statusMap[status].total += count;
      const severity = (item.severity || '').toLowerCase();
      if (severity === 'critical') statusMap[status].critical += count;
      else if (severity === 'high') statusMap[status].high += count;
      else if (severity === 'medium') statusMap[status].medium += count;
      else if (severity === 'low') statusMap[status].low += count;
    });
    return Object.values(statusMap);
  }, [filteredData]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredData.reduce((sum, d) => sum + (d.defect_count || d.count || 1), 0);
    const open = filteredData
      .filter((d) => {
        const s = (d.status || '').toLowerCase();
        return s === 'open' || s === 'reopened';
      })
      .reduce((sum, d) => sum + (d.defect_count || d.count || 1), 0);
    const critical = filteredData
      .filter((d) => (d.severity || '').toLowerCase() === 'critical')
      .reduce((sum, d) => sum + (d.defect_count || d.count || 1), 0);
    const closedResolved = filteredData
      .filter((d) => {
        const s = (d.status || '').toLowerCase();
        return s === 'closed' || s === 'resolved';
      })
      .reduce((sum, d) => sum + (d.defect_count || d.count || 1), 0);
    const closureRate = total > 0 ? (closedResolved / total) * 100 : 0;

    return { total, open, critical, closureRate };
  }, [filteredData]);

  // Severity breakdown columns
  const severityColumns = useMemo(
    () => [
      {
        key: 'severity',
        header: 'Severity',
        sortable: true,
        render: (value) => {
          const colorClass = getSeverityColor(value, 'text');
          return <span className={`font-semibold ${colorClass}`}>{value}</span>;
        },
      },
      { key: 'total', header: 'Total', sortable: true, render: (value) => formatNumber(value) },
      { key: 'open', header: 'Open', sortable: true, render: (value) => formatNumber(value) },
      { key: 'inProgress', header: 'In Progress', sortable: true, render: (value) => formatNumber(value) },
      { key: 'closed', header: 'Closed', sortable: true, render: (value) => formatNumber(value) },
    ],
    []
  );

  // Status breakdown columns
  const statusColumns = useMemo(
    () => [
      { key: 'status', header: 'Status', sortable: true, render: (value) => <span className="font-medium text-surface-800">{value}</span> },
      { key: 'total', header: 'Total', sortable: true, render: (value) => formatNumber(value) },
      { key: 'critical', header: 'Critical', sortable: true, render: (value) => <span className="text-danger-600 font-medium">{formatNumber(value)}</span> },
      { key: 'high', header: 'High', sortable: true, render: (value) => <span className="text-orange-500 font-medium">{formatNumber(value)}</span> },
      { key: 'medium', header: 'Medium', sortable: true, render: (value) => <span className="text-yellow-500 font-medium">{formatNumber(value)}</span> },
      { key: 'low', header: 'Low', sortable: true, render: (value) => <span className="text-success-600 font-medium">{formatNumber(value)}</span> },
    ],
    []
  );

  // Stacked bar chart colors for severity
  const severityChartColors = useMemo(
    () => [SEVERITY_COLORS.Critical, SEVERITY_COLORS.High, SEVERITY_COLORS.Medium, SEVERITY_COLORS.Low],
    []
  );

  // Status pie chart data
  const statusPieData = useMemo(() => {
    return statusBreakdown.map((item, idx) => ({
      name: item.status,
      value: item.total,
      fill: STATUS_COLORS[idx % STATUS_COLORS.length],
    }));
  }, [statusBreakdown]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading SIT Defect Summary..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="bg-white rounded-xl shadow-card p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Data</h3>
          <p className="text-surface-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">SIT Defect Summary</h2>
          <p className="text-surface-500 mt-1">
            Defect analysis across domains and severities for upcoming releases
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-surface-600 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors shadow-soft"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Defects" value={formatNumber(summaryMetrics.total)} color="brand" />
        <SummaryCard label="Open Defects" value={formatNumber(summaryMetrics.open)} color="warning" />
        <SummaryCard label="Critical Defects" value={formatNumber(summaryMetrics.critical)} color="danger" />
        <SummaryCard label="Closure Rate" value={formatPercentage(summaryMetrics.closureRate)} color="success" />
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 border-b border-surface-200">
        <TabButton
          active={activeTab === 'charts'}
          onClick={() => setActiveTab('charts')}
          icon={<BarChart3 className="w-4 h-4" />}
          label="Charts"
        />
        <TabButton
          active={activeTab === 'tables'}
          onClick={() => setActiveTab('tables')}
          icon={<Table2 className="w-4 h-4" />}
          label="Tables"
        />
      </div>

      {/* Charts View */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Overall Domain x Severity Chart */}
          <ChartCard
            title="Defects by Domain & Severity"
            subtitle="Stacked view across all filtered releases"
            type="stackedBar"
            data={domainSeverityChartData}
            dataKeys={['Critical', 'High', 'Medium', 'Low']}
            xAxisKey="name"
            colors={severityChartColors}
            height={350}
          />

          {/* Per-Release Charts */}
          {releaseChartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {releaseChartData.map((rc) => (
                <ChartCard
                  key={rc.release}
                  title={rc.release}
                  subtitle="Defects by Domain & Severity"
                  type="stackedBar"
                  data={rc.data}
                  dataKeys={['Critical', 'High', 'Medium', 'Low']}
                  xAxisKey="name"
                  colors={severityChartColors}
                  height={300}
                />
              ))}
            </div>
          )}

          {/* Status Distribution Pie */}
          {statusPieData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Defect Status Distribution"
                subtitle="Breakdown by current status"
                type="pie"
                data={statusPieData}
                dataKeys={['value']}
                xAxisKey="name"
                colors={STATUS_COLORS}
                height={300}
              />
              <ChartCard
                title="Severity Distribution"
                subtitle="Breakdown by severity level"
                type="pie"
                data={severityBreakdown.map((s) => ({
                  name: s.severity,
                  value: s.total,
                  fill: SEVERITY_COLORS[s.severity] || '#94a3b8',
                }))}
                dataKeys={['value']}
                xAxisKey="name"
                colors={severityChartColors}
                height={300}
              />
            </div>
          )}
        </div>
      )}

      {/* Tables View */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Severity Breakdown Table */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Severity Breakdown</h3>
            <DataTable
              columns={severityColumns}
              data={severityBreakdown}
              sortable
              paginated={false}
              getRowId={(row) => `sev-${row.severity}`}
            />
          </div>

          {/* Status Breakdown Table */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Status Breakdown</h3>
            <DataTable
              columns={statusColumns}
              data={statusBreakdown}
              sortable
              paginated={false}
              getRowId={(row) => `stat-${row.status}`}
            />
          </div>

          {/* Detailed Defect List */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              Detailed Defect List
              <span className="ml-2 text-sm font-normal text-surface-500">
                ({filteredData.length} records)
              </span>
            </h3>
            <DataTable
              columns={detailColumns}
              data={filteredData}
              sortable
              paginated
              getRowId={(row) => row.id || `sit-${row.domain}-${row.severity}-${row.status}`}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">No Data Available</h3>
          <p className="text-surface-500">
            No SIT defect data matches the current filters. Try adjusting your filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}

/** Detail columns for the full defect list table */
const detailColumns = [
  {
    key: 'domain',
    header: 'Domain',
    sortable: true,
    render: (value) => <span className="font-medium text-surface-800">{value || '—'}</span>,
  },
  {
    key: 'release',
    header: 'Release',
    sortable: true,
  },
  {
    key: 'program',
    header: 'Program',
    sortable: true,
  },
  {
    key: 'application',
    header: 'Application',
    sortable: true,
  },
  {
    key: 'severity',
    header: 'Severity',
    sortable: true,
    render: (value) => {
      const color = SEVERITY_COLORS[value] || '#94a3b8';
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {value || '—'}
        </span>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <span className="text-sm text-surface-700">{value || '—'}</span>,
  },
  {
    key: 'defect_count',
    header: 'Count',
    sortable: true,
    render: (value, row) => formatNumber(value || row.count || 0),
  },
];

/**
 * Summary card sub-component
 */
function SummaryCard({ label, value, color }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
    success: 'bg-success-50 text-success-700 border-success-200',
  };

  const classes = colorMap[color] || colorMap.brand;

  return (
    <div className={`rounded-xl border p-4 ${classes} shadow-soft transition-shadow hover:shadow-card`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(['brand', 'warning', 'danger', 'success']),
};

SummaryCard.defaultProps = {
  color: 'brand',
};

/**
 * Tab button sub-component
 */
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-brand-600 text-brand-600'
          : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

TabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
};

TabButton.defaultProps = {
  icon: null,
};