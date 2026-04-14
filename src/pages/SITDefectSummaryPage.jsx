import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import SITDefectSummary from '../components/dashboards/SITDefectSummary';
import DashboardService from '../services/DashboardService';
import { getMockData } from '../constants/mockData';

const dashboardService = new DashboardService();

export default function SITDefectSummaryPage() {
  const [filters, setFilters] = useState({
    release: '',
    impactedApplication: '',
    domain: '',
    priority: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    releases: [],
    applications: [],
    domains: [],
    priorities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result = [];
      try {
        result = await dashboardService.getSITDefects(filters);
      } catch (serviceErr) {
        const mockData = getMockData();
        result = mockData.sitDefects || mockData.defects || mockData.defectDetails || [];
      }

      if (!result || result.length === 0) {
        const mockData = getMockData();
        result = mockData.sitDefects || mockData.defects || mockData.defectDetails || [];
      }

      const releases = [...new Set(result.map((d) => d.release || d.release_name).filter(Boolean))];
      const applications = [...new Set(result.map((d) => d.impacted_application || d.application || d.application_name).filter(Boolean))];
      const domains = [...new Set(result.map((d) => d.domain || d.domain_name).filter(Boolean))];
      const priorities = [...new Set(result.map((d) => d.priority).filter(Boolean))];

      setFilterOptions({
        releases: [{ label: 'All Releases', value: '' }, ...releases.map((r) => ({ label: r, value: r }))],
        applications: [{ label: 'All Applications', value: '' }, ...applications.map((a) => ({ label: a, value: a }))],
        domains: [{ label: 'All Domains', value: '' }, ...domains.map((d) => ({ label: d, value: d }))],
        priorities: [{ label: 'All Priorities', value: '' }, ...priorities.sort().map((p) => ({ label: p, value: p }))],
      });
    } catch (err) {
      console.error('[SITDefectSummaryPage] Error:', err);
      setError(err.message || 'Failed to load SIT defect data');
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
        name: 'impactedApplication',
        label: 'Impacted Application',
        defaultValue: '',
        options: filterOptions.applications,
      },
      {
        name: 'domain',
        label: 'Domain',
        defaultValue: '',
        options: filterOptions.domains,
      },
      {
        name: 'priority',
        label: 'Priority',
        defaultValue: '',
        options: filterOptions.priorities,
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
        <h1 className="text-2xl font-bold text-surface-900">SIT Defect Summary</h1>
        <p className="mt-1 text-sm text-surface-500">
          Comprehensive view of SIT defects with severity distribution, domain breakdown, and trend analysis.
        </p>
      </div>

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      <SITDefectSummary filters={filters} />
    </div>
  );
}