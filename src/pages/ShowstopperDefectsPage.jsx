import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import ShowstopperDefectsTable from '../components/dashboards/ShowstopperDefectsTable';
import DashboardService from '../services/DashboardService';
import { getMockData } from '../constants/mockData';

const dashboardService = new DashboardService();

export default function ShowstopperDefectsPage() {
  const [filters, setFilters] = useState({
    release: '',
    application: '',
    environment: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    releases: [],
    applications: [],
    environments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result = [];
      try {
        result = await dashboardService.getShowstopperDefects(filters);
      } catch (serviceErr) {
        const mockData = getMockData();
        result = mockData.showstopperDefects || mockData.defects || mockData.defectDetails || [];
      }

      if (!result || result.length === 0) {
        const mockData = getMockData();
        result = mockData.showstopperDefects || mockData.defects || mockData.defectDetails || [];
      }

      const releases = [...new Set(result.map((d) => d.release || d.release_name).filter(Boolean))];
      const applications = [...new Set(result.map((d) => d.application || d.application_name || d.impacted_application).filter(Boolean))];
      const environments = [...new Set(result.map((d) => d.environment || d.found_in_environment).filter(Boolean))];

      setFilterOptions({
        releases: [{ label: 'All Releases', value: '' }, ...releases.map((r) => ({ label: r, value: r }))],
        applications: [{ label: 'All Applications', value: '' }, ...applications.map((a) => ({ label: a, value: a }))],
        environments: [{ label: 'All Environments', value: '' }, ...environments.map((e) => ({ label: e, value: e }))],
      });
    } catch (err) {
      console.error('[ShowstopperDefectsPage] Error:', err);
      setError(err.message || 'Failed to load showstopper defects data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const filterConfig = useMemo(
    () => [
      {
        name: 'release',
        label: 'Release',
        defaultValue: '',
        options: filterOptions.releases,
      },
      {
        name: 'application',
        label: 'Application',
        defaultValue: '',
        options: filterOptions.applications,
      },
      {
        name: 'environment',
        label: 'Environment',
        defaultValue: '',
        options: filterOptions.environments,
      },
    ],
    [filterOptions]
  );

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-danger-200 bg-danger-50 p-8 shadow-card animate-fade-in">
        <AlertTriangle className="h-10 w-10 text-danger-500" />
        <h3 className="mt-3 text-lg font-semibold text-danger-800">Error Loading Data</h3>
        <p className="mt-1 text-sm text-danger-600">{error}</p>
        <button
          onClick={fetchFilterOptions}
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Showstopper Defects</h1>
        <p className="mt-1 text-sm text-surface-500">
          Track and manage critical showstopper defects that may block release deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryStatCard
          label="Total Showstoppers"
          value="—"
          color="danger"
          loading={loading}
        />
        <SummaryStatCard
          label="Open / In Progress"
          value="—"
          color="warning"
          loading={loading}
        />
        <SummaryStatCard
          label="Resolved / Closed"
          value="—"
          color="success"
          loading={loading}
        />
      </div>

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      <ShowstopperDefectsTable filters={filters} />
    </div>
  );
}

function SummaryStatCard({ label, value, color, loading }) {
  const colorMap = {
    brand: 'bg-brand-50 border-brand-200 text-brand-700',
    danger: 'bg-danger-50 border-danger-200 text-danger-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    success: 'bg-success-50 border-success-200 text-success-700',
  };

  return (
    <div className={`rounded-xl border p-4 shadow-card ${colorMap[color] || colorMap.brand}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-current opacity-20" />
      ) : (
        <p className="mt-1 text-2xl font-bold">{value}</p>
      )}
    </div>
  );
}

SummaryStatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(['brand', 'danger', 'warning', 'success']),
  loading: PropTypes.bool,
};

SummaryStatCard.defaultProps = {
  color: 'brand',
  loading: false,
};

import PropTypes from 'prop-types';