import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ChartCard from '../common/ChartCard';
import FilterDropdown from '../common/FilterDropdown';
import { getMockData } from '../../constants/mockData';
import { SEVERITY_COLORS } from '../../constants/constants';

const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];

const SEVERITY_CHART_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
];

/**
 * Computes severity distribution from defect data
 * @param {Array<object>} defects - Array of defect objects
 * @returns {Array<object>} Distribution data shaped for charts
 */
function computeSeverityDistribution(defects) {
  const counts = {};
  SEVERITY_ORDER.forEach((sev) => {
    counts[sev] = 0;
  });

  defects.forEach((defect) => {
    const severity = defect.severity;
    if (severity && counts[severity] !== undefined) {
      counts[severity] += 1;
    }
  });

  return SEVERITY_ORDER.map((sev) => ({
    name: sev,
    value: counts[sev],
  }));
}

/**
 * Extracts unique values for a given key from an array of objects
 * @param {Array<object>} data - Source data array
 * @param {string} key - Object key to extract unique values from
 * @returns {Array<{label: string, value: string}>} Options array
 */
function extractFilterOptions(data, key) {
  const unique = [...new Set(data.map((item) => item[key]).filter(Boolean))];
  unique.sort();
  return [
    { label: 'All', value: '' },
    ...unique.map((val) => ({ label: val, value: val })),
  ];
}

/**
 * SeverityDistribution component
 * Displays pie and bar charts of defect distribution by severity.
 * Supports filtering by domain and application.
 */
export default function SeverityDistribution({ defects: externalDefects }) {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');

  const allDefects = useMemo(() => {
    if (externalDefects && externalDefects.length > 0) {
      return externalDefects;
    }
    const mockData = getMockData();
    return mockData.defects || [];
  }, [externalDefects]);

  const domainOptions = useMemo(
    () => extractFilterOptions(allDefects, 'domain'),
    [allDefects]
  );

  const applicationOptions = useMemo(() => {
    let filtered = allDefects;
    if (selectedDomain) {
      filtered = filtered.filter((d) => d.domain === selectedDomain);
    }
    return extractFilterOptions(filtered, 'application');
  }, [allDefects, selectedDomain]);

  const filteredDefects = useMemo(() => {
    let result = allDefects;
    if (selectedDomain) {
      result = result.filter((d) => d.domain === selectedDomain);
    }
    if (selectedApplication) {
      result = result.filter((d) => d.application === selectedApplication);
    }
    return result;
  }, [allDefects, selectedDomain, selectedApplication]);

  const distributionData = useMemo(
    () => computeSeverityDistribution(filteredDefects),
    [filteredDefects]
  );

  const totalDefects = useMemo(
    () => distributionData.reduce((sum, item) => sum + item.value, 0),
    [distributionData]
  );

  const handleDomainChange = (value) => {
    setSelectedDomain(value);
    setSelectedApplication('');
  };

  const handleApplicationChange = (value) => {
    setSelectedApplication(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-surface-900">
          Defect Distribution by Severity
        </h2>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <FilterDropdown
            options={domainOptions}
            value={selectedDomain}
            onChange={handleDomainChange}
            placeholder="All Domains"
            aria-label="Filter by domain"
          />
          <FilterDropdown
            options={applicationOptions}
            value={selectedApplication}
            onChange={handleApplicationChange}
            placeholder="All Applications"
            aria-label="Filter by application"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Severity Distribution (Pie)"
          type="pie"
          data={distributionData}
          dataKey="value"
          nameKey="name"
          colors={SEVERITY_CHART_COLORS}
          loading={false}
        />

        <ChartCard
          title="Severity Distribution (Bar)"
          type="bar"
          data={distributionData}
          dataKey="value"
          xAxisKey="name"
          colors={SEVERITY_CHART_COLORS}
          loading={false}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {distributionData.map((item, index) => {
          const percentage =
            totalDefects > 0
              ? ((item.value / totalDefects) * 100).toFixed(1)
              : '0.0';
          return (
            <div
              key={item.name}
              className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: SEVERITY_CHART_COLORS[index] }}
                />
                <span className="text-sm font-medium text-surface-700">
                  {item.name}
                </span>
              </div>
              <p className="text-2xl font-bold text-surface-900">{item.value}</p>
              <p className="text-xs text-surface-500 mt-1">{percentage}% of total</p>
            </div>
          );
        })}
      </div>

      {totalDefects === 0 && (
        <div className="text-center py-12 text-surface-500">
          <p className="text-lg font-medium">No defects found</p>
          <p className="text-sm mt-1">
            Adjust filters to view severity distribution data.
          </p>
        </div>
      )}
    </div>
  );
}

SeverityDistribution.propTypes = {
  defects: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.string,
      domain: PropTypes.string,
      application: PropTypes.string,
    })
  ),
};

SeverityDistribution.defaultProps = {
  defects: null,
};