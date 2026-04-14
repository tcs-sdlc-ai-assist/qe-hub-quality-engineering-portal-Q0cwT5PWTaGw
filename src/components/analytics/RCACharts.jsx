import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ChartCard from '../common/ChartCard';
import FilterDropdown from '../common/FilterDropdown';
import { getMockData } from '../../constants/mockData';
import { DOMAINS } from '../../constants/constants';
import { formatNumber, formatPercentage } from '../../utils/formatUtils';

/**
 * Aggregates defect data by a given RCA category field.
 * @param {Array<object>} defects - Array of defect objects
 * @param {string} field - The field to group by (e.g., 'rca_category', 'root_cause')
 * @returns {Array<{name: string, value: number}>} Aggregated data for charts
 */
function aggregateByField(defects, field) {
  const counts = {};
  defects.forEach((d) => {
    const key = d[field] || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Aggregates defect data by RCA category and severity.
 * @param {Array<object>} defects - Array of defect objects
 * @returns {Array<object>} Stacked bar data with severity breakdown
 */
function aggregateByCategoryAndSeverity(defects) {
  const grouped = {};
  defects.forEach((d) => {
    const category = d.rca_category || d.root_cause || 'Unknown';
    const severity = d.severity || 'Unknown';
    if (!grouped[category]) {
      grouped[category] = { name: category };
    }
    grouped[category][severity] = (grouped[category][severity] || 0) + 1;
  });
  return Object.values(grouped).sort((a, b) => {
    const totalA = Object.keys(a).reduce((sum, k) => (k !== 'name' ? sum + a[k] : sum), 0);
    const totalB = Object.keys(b).reduce((sum, k) => (k !== 'name' ? sum + b[k] : sum), 0);
    return totalB - totalA;
  });
}

/**
 * Extracts unique application names from defects.
 * @param {Array<object>} defects
 * @returns {Array<{label: string, value: string}>}
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

const PHASE_TABS = [
  { key: 'SIT', label: 'SIT' },
  { key: 'UAT', label: 'UAT' },
  { key: 'Prod', label: 'Production' },
];

const RCA_COLORS = [
  '#6366f1',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#22c55e',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#64748b',
];

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

const domainOptions = [
  { label: 'All Domains', value: '' },
  ...DOMAINS.map((d) => ({ label: d, value: d })),
];

/**
 * RCACharts - Root Cause Analysis charts component.
 * Displays RCA categorization charts for SIT, UAT, and Prod views.
 * Filters for domain and application. Uses Recharts via ChartCard with pie and bar chart options.
 */
export default function RCACharts({ defects: externalDefects }) {
  const [activePhase, setActivePhase] = useState('SIT');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');

  const allDefects = useMemo(() => {
    if (externalDefects && externalDefects.length > 0) {
      return externalDefects;
    }
    try {
      const data = getMockData();
      const defectList = data.defects || data.defectDetails || [];
      if (defectList.length > 0) {
        return defectList;
      }
      return generateFallbackDefects();
    } catch {
      return generateFallbackDefects();
    }
  }, [externalDefects]);

  const filteredDefects = useMemo(() => {
    let result = allDefects;

    result = result.filter((d) => {
      const phase = (d.phase || d.environment || d.testing_phase || '').toLowerCase();
      return phase.includes(activePhase.toLowerCase());
    });

    if (selectedDomain) {
      result = result.filter((d) => d.domain === selectedDomain);
    }

    if (selectedApplication) {
      result = result.filter((d) => d.application === selectedApplication);
    }

    return result;
  }, [allDefects, activePhase, selectedDomain, selectedApplication]);

  const applicationOptions = useMemo(() => {
    let subset = allDefects;
    if (selectedDomain) {
      subset = subset.filter((d) => d.domain === selectedDomain);
    }
    return [{ label: 'All Applications', value: '' }, ...getApplicationOptions(subset)];
  }, [allDefects, selectedDomain]);

  const rcaCategoryData = useMemo(
    () => aggregateByField(filteredDefects, 'rca_category'),
    [filteredDefects]
  );

  const rootCauseData = useMemo(
    () => aggregateByField(filteredDefects, 'root_cause'),
    [filteredDefects]
  );

  const severityBreakdownData = useMemo(
    () => aggregateByCategoryAndSeverity(filteredDefects),
    [filteredDefects]
  );

  const severityKeys = useMemo(() => {
    const keys = new Set();
    severityBreakdownData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== 'name') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [severityBreakdownData]);

  const totalDefects = filteredDefects.length;

  const topCategory = rcaCategoryData.length > 0 ? rcaCategoryData[0] : null;

  const handleDomainChange = useCallback(
    (value) => {
      setSelectedDomain(value);
      setSelectedApplication('');
    },
    []
  );

  const handleApplicationChange = useCallback((value) => {
    setSelectedApplication(value);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">
            Root Cause Analysis
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            Defect categorization and RCA breakdown by testing phase
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="flex items-center gap-4">
          <div className="bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg text-sm font-medium">
            {formatNumber(totalDefects)} Defects
          </div>
          {topCategory && (
            <div className="bg-danger-50 text-danger-600 px-3 py-1.5 rounded-lg text-sm font-medium">
              Top: {topCategory.name} ({formatPercentage(totalDefects > 0 ? (topCategory.value / totalDefects) * 100 : 0)})
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-card">
        {/* Phase Tabs */}
        <div className="flex rounded-lg bg-surface-100 p-1">
          {PHASE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActivePhase(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activePhase === tab.key
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Domain"
            options={domainOptions}
            value={selectedDomain}
            onChange={handleDomainChange}
          />
          <FilterDropdown
            label="Application"
            options={applicationOptions}
            value={selectedApplication}
            onChange={handleApplicationChange}
          />
        </div>
      </div>

      {/* Charts Grid */}
      {totalDefects === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <p className="text-surface-500 text-lg">
            No defect data available for {activePhase} phase
            {selectedDomain ? ` in ${selectedDomain}` : ''}
            {selectedApplication ? ` / ${selectedApplication}` : ''}.
          </p>
          <p className="text-surface-400 text-sm mt-2">
            Try adjusting your filters or uploading data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RCA Category Distribution - Pie */}
          <ChartCard
            title="RCA Category Distribution"
            subtitle={`${activePhase} defects by root cause category`}
            type="pie"
            data={rcaCategoryData}
            dataKey="value"
            nameKey="name"
            colors={RCA_COLORS}
            height={320}
          />

          {/* Root Cause Breakdown - Bar */}
          <ChartCard
            title="Root Cause Breakdown"
            subtitle={`Detailed root cause analysis for ${activePhase}`}
            type="bar"
            data={rootCauseData.slice(0, 10)}
            dataKey="value"
            xAxisKey="name"
            colors={RCA_COLORS}
            height={320}
          />

          {/* RCA by Severity - Stacked Bar */}
          {severityBreakdownData.length > 0 && (
            <ChartCard
              title="RCA Categories by Severity"
              subtitle={`Severity distribution across RCA categories (${activePhase})`}
              type="stackedBar"
              data={severityBreakdownData.slice(0, 8)}
              dataKey={severityKeys}
              xAxisKey="name"
              colors={severityKeys.map((k) => SEVERITY_COLORS[k] || '#64748b')}
              height={320}
            />
          )}

          {/* RCA Summary Table Card */}
          <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6">
            <h3 className="text-base font-semibold text-surface-900 mb-1">
              RCA Summary
            </h3>
            <p className="text-sm text-surface-500 mb-4">
              Top root cause categories for {activePhase}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-2 pr-4 font-medium text-surface-600">
                      Category
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-surface-600">
                      Count
                    </th>
                    <th className="text-right py-2 pl-4 font-medium text-surface-600">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rcaCategoryData.map((item, idx) => (
                    <tr
                      key={item.name}
                      className="border-b border-surface-100 last:border-0"
                    >
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                RCA_COLORS[idx % RCA_COLORS.length],
                            }}
                          />
                          <span className="text-surface-800 font-medium">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-2.5 px-4 text-surface-700 font-mono">
                        {formatNumber(item.value)}
                      </td>
                      <td className="text-right py-2.5 pl-4 text-surface-500">
                        {formatPercentage(
                          totalDefects > 0
                            ? (item.value / totalDefects) * 100
                            : 0
                        )}
                      </td>
                    </tr>
                  ))}
                  {rcaCategoryData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 text-center text-surface-400"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generates fallback defect data when no mock data is available.
 * @returns {Array<object>} Fallback defect array
 */
function generateFallbackDefects() {
  const categories = [
    'Code Defect',
    'Environment Issue',
    'Data Issue',
    'Requirements Gap',
    'Configuration Error',
    'Integration Failure',
    'Performance Issue',
    'Security Vulnerability',
  ];
  const rootCauses = [
    'Missing validation',
    'Incorrect mapping',
    'Null pointer',
    'Timeout configuration',
    'Data migration error',
    'API contract mismatch',
    'Memory leak',
    'Race condition',
    'Missing error handling',
    'Incorrect business logic',
  ];
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const phases = ['SIT', 'UAT', 'Prod'];
  const domains = [
    'Digital Banking',
    'Payments',
    'Lending',
    'Cards',
    'Core Banking',
  ];
  const applications = [
    'Mobile App',
    'Web Portal',
    'API Gateway',
    'Payment Engine',
    'Loan Origination',
    'Card Management',
  ];

  const defects = [];
  for (let i = 0; i < 120; i++) {
    defects.push({
      id: `dd-${i + 1}`,
      rca_category: categories[i % categories.length],
      root_cause: rootCauses[i % rootCauses.length],
      severity: severities[i % severities.length],
      phase: phases[i % phases.length],
      environment: phases[i % phases.length],
      testing_phase: phases[i % phases.length],
      domain: domains[i % domains.length],
      application: applications[i % applications.length],
    });
  }
  return defects;
}

RCACharts.propTypes = {
  defects: PropTypes.arrayOf(PropTypes.object),
};

RCACharts.defaultProps = {
  defects: null,
};