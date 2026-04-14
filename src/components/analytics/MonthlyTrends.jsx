import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ChartCard from '../common/ChartCard';
import DataTable from '../common/DataTable';
import FilterBar from '../common/FilterBar';
import MetricCard from '../common/MetricCard';
import { getMockData } from '../../constants/mockData';
import { DOMAINS } from '../../constants/constants';
import { formatPercentage, formatNumber } from '../../utils/formatUtils';
import { filterByField, getUniqueValues } from '../../utils/filterUtils';
import { Activity, TrendingUp, Bug, CheckCircle, BarChart3 } from 'lucide-react';

/**
 * Computes aggregated monthly QE metrics from raw data
 * @param {Array<object>} data - Raw monthly trend records
 * @returns {object} Aggregated metrics
 */
function computeAggregatedMetrics(data) {
  if (!data || data.length === 0) {
    return {
      totalTestCases: 0,
      totalExecuted: 0,
      totalPassed: 0,
      totalDefects: 0,
      avgPassRate: 0,
      avgDefectDensity: 0,
    };
  }

  const totalTestCases = data.reduce((sum, r) => sum + (r.totalTestCases || 0), 0);
  const totalExecuted = data.reduce((sum, r) => sum + (r.executed || 0), 0);
  const totalPassed = data.reduce((sum, r) => sum + (r.passed || 0), 0);
  const totalDefects = data.reduce((sum, r) => sum + (r.totalDefects || 0), 0);
  const avgPassRate = totalExecuted > 0 ? (totalPassed / totalExecuted) * 100 : 0;
  const avgDefectDensity = data.reduce((sum, r) => sum + (r.defectDensity || 0), 0) / data.length;

  return {
    totalTestCases,
    totalExecuted,
    totalPassed,
    totalDefects,
    avgPassRate,
    avgDefectDensity,
  };
}

/**
 * Builds chart data for monthly execution trends
 * @param {Array<object>} data - Filtered monthly trend records
 * @returns {Array<object>} Chart-ready data
 */
function buildExecutionTrendData(data) {
  const monthMap = {};
  const sorted = [...data].sort((a, b) => {
    if (a.month && b.month) return a.month.localeCompare(b.month);
    return 0;
  });

  sorted.forEach((record) => {
    const period = record.month || 'Unknown';
    if (!monthMap[period]) {
      monthMap[period] = {
        period,
        executed: 0,
        passed: 0,
        failed: 0,
        totalDefects: 0,
      };
    }
    monthMap[period].executed += record.executed || 0;
    monthMap[period].passed += record.passed || 0;
    monthMap[period].failed += record.failed || 0;
    monthMap[period].totalDefects += record.totalDefects || 0;
  });

  return Object.values(monthMap);
}

/**
 * Builds chart data for pass rate by domain
 * @param {Array<object>} data - Filtered monthly trend records
 * @returns {Array<object>} Chart-ready data
 */
function buildPassRateByDomain(data) {
  const domainMap = {};

  data.forEach((record) => {
    const domain = record.domain || 'Unknown';
    if (!domainMap[domain]) {
      domainMap[domain] = { domain, totalExecuted: 0, totalPassed: 0 };
    }
    domainMap[domain].totalExecuted += record.executed || 0;
    domainMap[domain].totalPassed += record.passed || 0;
  });

  return Object.values(domainMap).map((d) => ({
    name: d.domain,
    passRate: d.totalExecuted > 0 ? parseFloat(((d.totalPassed / d.totalExecuted) * 100).toFixed(1)) : 0,
  }));
}

/**
 * Builds chart data for defect density trend
 * @param {Array<object>} data - Filtered monthly trend records
 * @returns {Array<object>} Chart-ready data
 */
function buildDefectDensityTrend(data) {
  const monthMap = {};
  const sorted = [...data].sort((a, b) => {
    if (a.month && b.month) return a.month.localeCompare(b.month);
    return 0;
  });

  sorted.forEach((record) => {
    const period = record.month || 'Unknown';
    if (!monthMap[period]) {
      monthMap[period] = { period, densitySum: 0, count: 0 };
    }
    monthMap[period].densitySum += record.defectDensity || 0;
    monthMap[period].count += 1;
  });

  return Object.values(monthMap).map((m) => ({
    period: m.period,
    defectDensity: parseFloat((m.densitySum / m.count).toFixed(2)),
  }));
}

/**
 * Generates mock monthly trend data from existing mock data sources
 * @returns {Array<object>} Monthly trend records
 */
function getMonthlyTrendData() {
  const mockData = getMockData();
  const monthlyTrends = mockData.monthlyTrends;

  if (monthlyTrends && monthlyTrends.length > 0) {
    return monthlyTrends;
  }

  const domains = DOMAINS.map((d) => d.value).filter(Boolean);
  const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
  const applications = ['App Portal', 'Mobile Banking', 'Payment Gateway', 'Loan Origination', 'Card Management'];

  const generated = [];
  let id = 1;

  domains.forEach((domain) => {
    months.forEach((month) => {
      const appSubset = applications.slice(0, 2 + Math.floor(Math.random() * 3));
      appSubset.forEach((app) => {
        const totalTestCases = 100 + Math.floor(Math.random() * 400);
        const executed = Math.floor(totalTestCases * (0.7 + Math.random() * 0.3));
        const passed = Math.floor(executed * (0.75 + Math.random() * 0.2));
        const failed = executed - passed;
        const totalDefects = failed + Math.floor(Math.random() * 10);
        const defectDensity = parseFloat((totalDefects / (totalTestCases / 100)).toFixed(2));

        generated.push({
          id: `mt-${id++}`,
          domain,
          application: app,
          month,
          totalTestCases,
          executed,
          passed,
          failed,
          totalDefects,
          defectDensity,
          passRate: parseFloat(((passed / executed) * 100).toFixed(1)),
        });
      });
    });
  });

  return generated;
}

const TABLE_COLUMNS = [
  { key: 'domain', header: 'Domain', sortable: true, width: '140px' },
  { key: 'application', header: 'Application', sortable: true, width: '160px' },
  { key: 'month', header: 'Month', sortable: true, width: '100px' },
  { key: 'totalTestCases', header: 'Total TCs', sortable: true, width: '100px',
    render: (value) => formatNumber(value),
  },
  { key: 'executed', header: 'Executed', sortable: true, width: '100px',
    render: (value) => formatNumber(value),
  },
  { key: 'passed', header: 'Passed', sortable: true, width: '90px',
    render: (value) => (
      <span className="text-success-600 font-medium">{formatNumber(value)}</span>
    ),
  },
  { key: 'failed', header: 'Failed', sortable: true, width: '90px',
    render: (value) => (
      <span className="text-danger-600 font-medium">{formatNumber(value)}</span>
    ),
  },
  { key: 'passRate', header: 'Pass Rate', sortable: true, width: '100px',
    render: (value) => {
      const color = value >= 90 ? 'text-success-600' : value >= 75 ? 'text-warning-600' : 'text-danger-600';
      return <span className={`font-semibold ${color}`}>{formatPercentage(value)}</span>;
    },
  },
  { key: 'totalDefects', header: 'Defects', sortable: true, width: '90px',
    render: (value) => formatNumber(value),
  },
  { key: 'defectDensity', header: 'Defect Density', sortable: true, width: '120px',
    render: (value) => (
      <span className="font-mono text-sm">{value != null ? value.toFixed(2) : '—'}</span>
    ),
  },
];

/**
 * MonthlyTrends component - displays monthly QE snapshot with charts and tabular data
 * @param {object} props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
export default function MonthlyTrends({ className }) {
  const [filters, setFilters] = useState({ domain: '', application: '' });

  const rawData = useMemo(() => getMonthlyTrendData(), []);

  const domainOptions = useMemo(() => {
    const domains = getUniqueValues(rawData, 'domain');
    return [{ label: 'All Domains', value: '' }, ...domains.map((d) => ({ label: d, value: d }))];
  }, [rawData]);

  const applicationOptions = useMemo(() => {
    let subset = rawData;
    if (filters.domain) {
      subset = filterByField(rawData, 'domain', filters.domain);
    }
    const apps = getUniqueValues(subset, 'application');
    return [{ label: 'All Applications', value: '' }, ...apps.map((a) => ({ label: a, value: a }))];
  }, [rawData, filters.domain]);

  const filterConfig = useMemo(() => [
    { name: 'domain', label: 'Domain', defaultValue: '', options: domainOptions },
    { name: 'application', label: 'Application', defaultValue: '', options: applicationOptions },
  ], [domainOptions, applicationOptions]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => {
      if (prev.domain !== newFilters.domain) {
        return { domain: newFilters.domain, application: '' };
      }
      return newFilters;
    });
  }, []);

  const filteredData = useMemo(() => {
    let result = rawData;
    if (filters.domain) {
      result = filterByField(result, 'domain', filters.domain);
    }
    if (filters.application) {
      result = filterByField(result, 'application', filters.application);
    }
    return result;
  }, [rawData, filters]);

  const metrics = useMemo(() => computeAggregatedMetrics(filteredData), [filteredData]);

  const executionTrendData = useMemo(() => buildExecutionTrendData(filteredData), [filteredData]);

  const passRateByDomainData = useMemo(() => buildPassRateByDomain(filteredData), [filteredData]);

  const defectDensityData = useMemo(() => buildDefectDensityTrend(filteredData), [filteredData]);

  const latestMonth = useMemo(() => {
    if (filteredData.length === 0) return null;
    const months = filteredData.map((r) => r.month).filter(Boolean);
    months.sort();
    return months[months.length - 1];
  }, [filteredData]);

  const latestMonthData = useMemo(() => {
    if (!latestMonth) return [];
    return filteredData.filter((r) => r.month === latestMonth);
  }, [filteredData, latestMonth]);

  const previousMetrics = useMemo(() => {
    if (!latestMonth || filteredData.length === 0) return null;
    const months = [...new Set(filteredData.map((r) => r.month).filter(Boolean))].sort();
    const latestIdx = months.indexOf(latestMonth);
    if (latestIdx <= 0) return null;
    const prevMonth = months[latestIdx - 1];
    const prevData = filteredData.filter((r) => r.month === prevMonth);
    return computeAggregatedMetrics(prevData);
  }, [filteredData, latestMonth]);

  const currentMonthMetrics = useMemo(() => computeAggregatedMetrics(latestMonthData), [latestMonthData]);

  const passRateTrend = useMemo(() => {
    if (!previousMetrics) return 0;
    return parseFloat((currentMonthMetrics.avgPassRate - previousMetrics.avgPassRate).toFixed(1));
  }, [currentMonthMetrics, previousMetrics]);

  const defectTrend = useMemo(() => {
    if (!previousMetrics) return 0;
    return currentMonthMetrics.totalDefects - previousMetrics.totalDefects;
  }, [currentMonthMetrics, previousMetrics]);

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Monthly QE Trends</h2>
          <p className="text-surface-500 mt-1">
            Delivery snapshot and quality metrics by domain and application
            {latestMonth && (
              <span className="ml-2 text-brand-600 font-medium">
                Latest: {latestMonth}
              </span>
            )}
          </p>
        </div>
      </div>

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Test Cases"
          value={formatNumber(metrics.totalTestCases)}
          icon={BarChart3}
        />
        <MetricCard
          title="Executed"
          value={formatNumber(metrics.totalExecuted)}
          subtitle={`${metrics.totalTestCases > 0 ? formatPercentage((metrics.totalExecuted / metrics.totalTestCases) * 100) : '0%'} coverage`}
          icon={Activity}
        />
        <MetricCard
          title="Avg Pass Rate"
          value={formatPercentage(currentMonthMetrics.avgPassRate)}
          trend={passRateTrend !== 0 ? (passRateTrend > 0 ? 'up' : 'down') : undefined}
          trendValue={passRateTrend !== 0 ? `${Math.abs(passRateTrend)}%` : undefined}
          icon={CheckCircle}
        />
        <MetricCard
          title="Total Defects"
          value={formatNumber(metrics.totalDefects)}
          trend={defectTrend !== 0 ? (defectTrend > 0 ? 'up' : 'down') : undefined}
          trendValue={defectTrend !== 0 ? `${Math.abs(defectTrend)}` : undefined}
          icon={Bug}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Execution Trend"
          subtitle="Monthly test execution and pass/fail breakdown"
          type="bar"
          data={executionTrendData}
          dataKeys={['passed', 'failed']}
          xAxisKey="period"
          colors={['#22c55e', '#ef4444']}
          height={300}
        />
        <ChartCard
          title="Defect Density Trend"
          subtitle="Average defect density per month"
          type="line"
          data={defectDensityData}
          dataKeys={['defectDensity']}
          xAxisKey="period"
          colors={['#f59e0b']}
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Pass Rate by Domain"
          subtitle="Test execution pass rate across domains"
          type="bar"
          data={passRateByDomainData}
          dataKeys={['passRate']}
          xAxisKey="name"
          colors={['#6366f1']}
          height={300}
        />
        <ChartCard
          title="Monthly Defects Overview"
          subtitle="Total defects reported per month"
          type="bar"
          data={executionTrendData}
          dataKeys={['totalDefects']}
          xAxisKey="period"
          colors={['#ef4444']}
          height={300}
        />
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-surface-900">
            Detailed Monthly Snapshot
            {latestMonth && (
              <span className="ml-2 text-sm font-normal text-surface-500">
                Showing latest month: {latestMonth}
              </span>
            )}
          </h3>
        </div>
        <DataTable
          columns={TABLE_COLUMNS}
          data={latestMonthData.length > 0 ? latestMonthData : filteredData}
          sortable
          paginated
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}

MonthlyTrends.propTypes = {
  className: PropTypes.string,
};

MonthlyTrends.defaultProps = {
  className: '',
};