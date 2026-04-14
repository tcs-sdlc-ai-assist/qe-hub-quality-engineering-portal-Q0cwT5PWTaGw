import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ChartCard from '../common/ChartCard';
import FilterDropdown from '../common/FilterDropdown';
import { getMockData } from '../../constants/mockData';
import { DOMAIN_OPTIONS } from '../../constants/constants';

/**
 * Extracts unique application names from defect data, optionally filtered by domain.
 * @param {Array<object>} defects - Array of defect objects
 * @param {string} domain - Selected domain filter value
 * @returns {Array<{label: string, value: string}>} Application options
 */
function getApplicationOptions(defects, domain) {
  const filtered = domain
    ? defects.filter((d) => d.domain === domain)
    : defects;
  const apps = [...new Set(filtered.map((d) => d.application).filter(Boolean))];
  apps.sort();
  return apps.map((app) => ({ label: app, value: app }));
}

/**
 * Builds stacked bar chart data: one bar per application, stacked by environment.
 * @param {Array<object>} defects - Array of defect objects
 * @param {string} domain - Selected domain filter
 * @param {string} application - Selected application filter
 * @returns {{ chartData: Array<object>, environments: string[] }}
 */
function buildEnvironmentDistributionData(defects, domain, application) {
  let filtered = [...defects];

  if (domain) {
    filtered = filtered.filter((d) => d.domain === domain);
  }
  if (application) {
    filtered = filtered.filter((d) => d.application === application);
  }

  const envSet = new Set();
  const appEnvMap = {};

  filtered.forEach((defect) => {
    const app = defect.application || 'Unknown';
    const env = defect.environment || 'Unknown';
    envSet.add(env);

    if (!appEnvMap[app]) {
      appEnvMap[app] = {};
    }
    appEnvMap[app][env] = (appEnvMap[app][env] || 0) + 1;
  });

  const environments = [...envSet].sort();
  const applications = Object.keys(appEnvMap).sort();

  const chartData = applications.map((app) => {
    const entry = { application: app };
    environments.forEach((env) => {
      entry[env] = appEnvMap[app][env] || 0;
    });
    return entry;
  });

  return { chartData, environments };
}

const ENV_COLORS = [
  '#6366f1', // brand-500 (SIT)
  '#14b8a6', // accent/teal (UAT)
  '#f59e0b', // amber (Prod)
  '#ef4444', // red
  '#22c55e', // green
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

/**
 * EnvironmentDistribution component displays a stacked bar chart of defect
 * distribution by application, stacked by environment (SIT/UAT/Prod).
 * Supports filtering by domain and application.
 */
export default function EnvironmentDistribution({ className }) {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');

  const mockData = useMemo(() => getMockData(), []);

  const defects = useMemo(() => {
    const data = mockData || {};
    return data.defects || data.sitDefectSummary || data.defectDetails || [];
  }, [mockData]);

  const domainOptions = useMemo(() => {
    if (DOMAIN_OPTIONS && DOMAIN_OPTIONS.length > 0) {
      return DOMAIN_OPTIONS;
    }
    const domains = [...new Set(defects.map((d) => d.domain).filter(Boolean))].sort();
    return domains.map((d) => ({ label: d, value: d }));
  }, [defects]);

  const applicationOptions = useMemo(
    () => getApplicationOptions(defects, selectedDomain),
    [defects, selectedDomain]
  );

  const handleDomainChange = (value) => {
    setSelectedDomain(value);
    setSelectedApplication('');
  };

  const handleApplicationChange = (value) => {
    setSelectedApplication(value);
  };

  const { chartData, environments } = useMemo(
    () => buildEnvironmentDistributionData(defects, selectedDomain, selectedApplication),
    [defects, selectedDomain, selectedApplication]
  );

  const colorMap = useMemo(() => {
    const map = {};
    environments.forEach((env, idx) => {
      map[env] = ENV_COLORS[idx % ENV_COLORS.length];
    });
    return map;
  }, [environments]);

  const colors = useMemo(
    () => environments.map((env) => colorMap[env]),
    [environments, colorMap]
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="min-w-[180px]">
          <FilterDropdown
            label="Domain"
            options={[{ label: 'All Domains', value: '' }, ...domainOptions]}
            value={selectedDomain}
            onChange={handleDomainChange}
          />
        </div>
        <div className="min-w-[180px]">
          <FilterDropdown
            label="Application"
            options={[{ label: 'All Applications', value: '' }, ...applicationOptions]}
            value={selectedApplication}
            onChange={handleApplicationChange}
          />
        </div>
      </div>

      <ChartCard
        title="Defect Distribution by Environment"
        subtitle={
          selectedDomain
            ? `Filtered by ${selectedDomain}${selectedApplication ? ` / ${selectedApplication}` : ''}`
            : 'All domains and applications'
        }
        type="stackedBar"
        data={chartData}
        dataKey="application"
        categories={environments}
        colors={colors}
        loading={false}
        height={380}
      />

      {chartData.length === 0 && (
        <div className="text-center py-8 text-surface-500 text-sm">
          No defect data available for the selected filters.
        </div>
      )}
    </div>
  );
}

EnvironmentDistribution.propTypes = {
  className: PropTypes.string,
};

EnvironmentDistribution.defaultProps = {
  className: '',
};