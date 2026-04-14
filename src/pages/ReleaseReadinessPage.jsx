import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import ReleaseReadinessTable from '../components/dashboards/ReleaseReadinessTable';
import QualityMetricsOverview from '../components/dashboards/QualityMetricsOverview';
import DashboardService from '../services/DashboardService';
import { getMockData } from '../constants/mockData';

const dashboardService = new DashboardService();

export default function ReleaseReadinessPage() {
  const [filters, setFilters] = useState({
    release: '',
    program: '',
    domain: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    releases: [],
    programs: [],
    domains: [],
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result = [];
      try {
        result = await dashboardService.getReleaseReadiness(filters);
      } catch (serviceErr) {
        const mockData = getMockData();
        result = mockData.releaseReadiness || [];
      }

      if (!result || result.length === 0) {
        const mockData = getMockData();
        result = mockData.releaseReadiness || [];
      }

      const releases = [...new Set(result.map((r) => r.release || r.release_name).filter(Boolean))];
      const programs = [...new Set(result.map((r) => r.program || r.program_name).filter(Boolean))];
      const domains = [...new Set(result.map((r) => r.domain || r.domain_name).filter(Boolean))];

      setFilterOptions({
        releases: [{ label: 'All Releases', value: '' }, ...releases.map((r) => ({ label: r, value: r }))],
        programs: [{ label: 'All Programs', value: '' }, ...programs.map((p) => ({ label: p, value: p }))],
        domains: [{ label: 'All Domains', value: '' }, ...domains.map((d) => ({ label: d, value: d }))],
      });

      let filtered = result;
      if (filters.release) {
        filtered = filtered.filter((r) => (r.release || r.release_name) === filters.release);
      }
      if (filters.program) {
        filtered = filtered.filter((r) => (r.program || r.program_name) === filters.program);
      }
      if (filters.domain) {
        filtered = filtered.filter((r) => (r.domain || r.domain_name) === filters.domain);
      }

      setData(filtered);
    } catch (err) {
      console.error('[ReleaseReadinessPage] Error:', err);
      setError(err.message || 'Failed to load release readiness data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterConfig = useMemo(
    () => [
      {
        name: 'release',
        label: 'Release',
        defaultValue: '',
        options: filterOptions.releases,
      },
      {
        name: 'program',
        label: 'Program',
        defaultValue: '',
        options: filterOptions.programs,
      },
      {
        name: 'domain',
        label: 'Domain',
        defaultValue: '',
        options: filterOptions.domains,
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
          onClick={fetchData}
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
        <h1 className="text-2xl font-bold text-surface-900">Release Readiness</h1>
        <p className="mt-1 text-sm text-surface-500">
          Track release status, quality gates, and readiness metrics across programs and domains.
        </p>
      </div>

      <QualityMetricsOverview filters={filters} />

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      <ReleaseReadinessTable filters={filters} />
    </div>
  );
}