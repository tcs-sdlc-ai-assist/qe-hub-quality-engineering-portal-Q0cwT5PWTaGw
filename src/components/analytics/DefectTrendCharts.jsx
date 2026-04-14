import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ChartCard from '../common/ChartCard';
import FilterBar from '../common/FilterBar';
import { getMockData } from '../../constants/mockData';
import { DOMAINS } from '../../constants/constants';
import { buildTrendData, getChartColor } from '../../utils/chartUtils';
import { applyFilters } from '../../utils/filterUtils';

/**
 * Extracts unique application names from defect data.
 * @param {Array<object>} defects - Array of defect objects
 * @returns {Array<{label: string, value: string}>} Application options
 */
function getApplicationOptions(defects) {
  const apps = new Set();
  defects.forEach((d) => {
    if (d.application) {
      apps.add(d.application);
    }
  });
  return Array.from(apps)
    .sort()
    .map((app) => ({ label: app, value: app }));
}

/**
 * Builds monthly defect trend data grouped by severity.
 * @param {Array<object>} defects - Filtered defect array
 * @returns {Array<object>} Trend data with period and severity counts
 */
function buildMonthlyDefectTrend(defects) {
  return buildTrendData(defects, 'created_date', 'count', 'severity');
}

/**
 * Builds weekly defect trend data (open vs closed).
 * @param {Array<object>} defects - Filtered defect array
 * @returns {Array<object>} Trend data with period and status counts
 */
function buildStatusTrend(defects) {
  const statusGrouped = defects.map((d) => ({
    ...d,
    status_group: d.status === 'Closed' || d.status === 'Resolved' ? 'Closed' : 'Open',
  }));
  return buildTrendData(statusGrouped, 'created_date', 'count', 'status_group');
}

/**
 * Builds defect count by domain for bar chart.
 * @param {Array<object>} defects - Filtered defect array
 * @returns {Array<object>} Domain defect counts
 */
function buildDomainDistribution(defects) {
  const domainMap = {};
  defects.forEach((d) => {
    const domain = d.domain || 'Unknown';
    if (!domainMap[domain]) {
      domainMap[domain] = { domain, count: 0 };
    }
    domainMap[domain].count += 1;
  });
  return Object.values(domainMap).sort((a, b) => b.count - a.count);
}

/**
 * Builds severity distribution for pie chart.
 * @param {Array<object>} defects - Filtered defect array
 * @returns {Array<object>} Severity counts with name and value keys
 */
function buildSeverityDistribution(defects) {
  const severityMap = {};
  defects.forEach((d) => {
    const sev = d.severity || 'Unknown';
    if (!severityMap[sev]) {
      severityMap[sev] = { name: sev, value: 0 };
    }
    severityMap[sev].value += 1;
  });
  const order = ['Critical', 'High', 'Medium', 'Low', 'Unknown'];
  return order
    .filter((s) => severityMap[s])
    .map((s) => severityMap[s]);
}

const SEVERITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#94a3b8'];

/**
 * DefectTrendCharts - Displays defect trend visualizations using line, bar, and pie charts.
 * Filters by domain and application. Sources data from mock Jira defect data.
 */
export default function DefectTrendCharts({ className }) {
  const [filters, setFilters] = useState({
    domain: '',
    application: '',
  });

  const mockData = useMemo(() => getMockData(), []);

  const defects = useMemo(() => {
    const allDefects = mockData.defects || mockData.defectDetails || [];
    return allDefects;
  }, [mockData]);

  const applicationOptions = useMemo(() => getApplicationOptions(defects), [defects]);

  const domainOptions = useMemo(() => {
    const domains = DOMAINS || [];
    return [
      ...domains.map((d) => ({
        label: typeof d === 'string' ? d : d.label || d.name || String(d),
        value: typeof d === 'string' ? d : d.value || d.name || String(d),
      })),
    ];
  }, []);

  const filterConfig = useMemo(
    () => [
      {
        name: 'domain',
        label: 'Domain',
        defaultValue: '',
        options: [{ label: 'All Domains', value: '' }, ...domainOptions],
      },
      {
        name: 'application',
        label: 'Application',
        defaultValue: '',
        options: [{ label: 'All Applications', value: '' }, ...applicationOptions],
      },
    ],
    [domainOptions, applicationOptions]
  );

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredDefects = useMemo(() => {
    const activeFilters = {};
    if (filters.domain) {
      activeFilters.domain = filters.domain;
    }
    if (filters.application) {
      activeFilters.application = filters.application;
    }
    if (Object.keys(activeFilters).length === 0) {
      return defects;
    }
    return applyFilters(defects, activeFilters);
  }, [defects, filters]);

  const monthlyTrendData = useMemo(
    () => buildMonthlyDefectTrend(filteredDefects),
    [filteredDefects]
  );

  const statusTrendData = useMemo(
    () => buildStatusTrend(filteredDefects),
    [filteredDefects]
  );

  const domainDistData = useMemo(
    () => buildDomainDistribution(filteredDefects),
    [filteredDefects]
  );

  const severityDistData = useMemo(
    () => buildSeverityDistribution(filteredDefects),
    [filteredDefects]
  );

  const trendSeverityKeys = useMemo(() => {
    const keys = new Set();
    monthlyTrendData.forEach((item) => {
      Object.keys(item).forEach((k) => {
        if (k !== 'period') {
          keys.add(k);
        }
      });
    });
    const order = ['Critical', 'High', 'Medium', 'Low'];
    const sorted = [];
    order.forEach((s) => {
      if (keys.has(s)) {
        sorted.push(s);
      }
    });
    keys.forEach((k) => {
      if (!sorted.includes(k)) {
        sorted.push(k);
      }
    });
    return sorted;
  }, [monthlyTrendData]);

  const statusKeys = useMemo(() => {
    const keys = new Set();
    statusTrendData.forEach((item) => {
      Object.keys(item).forEach((k) => {
        if (k !== 'period') {
          keys.add(k);
        }
      });
    });
    return Array.from(keys);
  }, [statusTrendData]);

  const trendChartData = useMemo(
    () =>
      trendSeverityKeys.map((key, idx) => ({
        dataKey: key,
        name: key,
        color: SEVERITY_COLORS[idx] || getChartColor(idx),
      })),
    [trendSeverityKeys]
  );

  const statusChartData = useMemo(
    () =>
      statusKeys.map((key, idx) => ({
        dataKey: key,
        name: key,
        color: key === 'Open' ? '#ef4444' : '#22c55e',
      })),
    [statusKeys]
  );

  const hasData = filteredDefects.length > 0;

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Defect Trend Analysis</h2>
          <p className="mt-1 text-sm text-surface-500">
            Track defect trends by severity, status, domain, and application
          </p>
        </div>
        <span className="text-sm text-surface-400 font-mono">
          {filteredDefects.length} defect{filteredDefects.length !== 1 ? 's' : ''}
        </span>
      </div>

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      {!hasData ? (
        <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-card animate-fade-in">
          <div className="text-center">
            <p className="text-surface-500 text-sm">No defect data available for the selected filters.</p>
            <p className="text-surface-400 text-xs mt-1">Try adjusting your filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Defect Trend by Severity"
            subtitle="Monthly defect counts grouped by severity level"
            type="line"
            data={monthlyTrendData}
            series={trendChartData}
            xAxisKey="period"
            colors={SEVERITY_COLORS}
            loading={false}
          />

          <ChartCard
            title="Open vs Closed Trend"
            subtitle="Monthly open and closed defect counts"
            type="stackedBar"
            data={statusTrendData}
            series={statusChartData}
            xAxisKey="period"
            colors={['#ef4444', '#22c55e']}
            loading={false}
          />

          <ChartCard
            title="Defects by Domain"
            subtitle="Total defect count per domain"
            type="bar"
            data={domainDistData}
            series={[{ dataKey: 'count', name: 'Defects', color: getChartColor(0) }]}
            xAxisKey="domain"
            loading={false}
          />

          <ChartCard
            title="Severity Distribution"
            subtitle="Defect breakdown by severity level"
            type="pie"
            data={severityDistData}
            series={[{ dataKey: 'value', nameKey: 'name' }]}
            colors={SEVERITY_COLORS}
            loading={false}
          />
        </div>
      )}
    </div>
  );
}

DefectTrendCharts.propTypes = {
  className: PropTypes.string,
};

DefectTrendCharts.defaultProps = {
  className: '',
};