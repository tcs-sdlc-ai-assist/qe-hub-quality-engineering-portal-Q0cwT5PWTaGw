import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Clock, RefreshCw, Download } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import DeferredDefectsTable from '../components/dashboards/DeferredDefectsTable';
import { getMockData } from '../constants/mockData';
import { DOMAINS } from '../constants/constants';

export default function DeferredDefectsPage() {
  const [filters, setFilters] = useState({
    domain: '',
    application: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const mockData = useMemo(() => getMockData(), []);

  const applications = useMemo(() => {
    const deferredDefects = mockData.deferredDefects || mockData.defects || [];
    let filtered = deferredDefects;
    if (filters.domain) {
      filtered = filtered.filter((d) => d.domain === filters.domain || d.domainName === filters.domain);
    }
    const appSet = new Set();
    filtered.forEach((d) => {
      const app = d.application || d.applicationName || d.app_name;
      if (app) appSet.add(app);
    });
    return [...appSet].sort();
  }, [mockData, filters.domain]);

  const filterConfig = useMemo(() => [
    {
      name: 'domain',
      label: 'Domain',
      defaultValue: '',
      options: [
        { label: 'All Domains', value: '' },
        ...DOMAINS.map((d) => ({ label: d, value: d })),
      ],
    },
    {
      name: 'application',
      label: 'Application',
      defaultValue: '',
      options: [
        { label: 'All Applications', value: '' },
        ...applications.map((a) => ({ label: a, value: a })),
      ],
    },
  ], [applications]);

  const handleFilterChange = useCallback((newFilters) => {
    if (newFilters.domain !== filters.domain) {
      setFilters({ ...newFilters, application: '' });
    } else {
      setFilters(newFilters);
    }
  }, [filters.domain]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const data = getMockData();
      const deferredDefects = data.deferredDefects || data.defects || [];
      let filtered = deferredDefects.filter(
        (d) => d.status === 'Deferred' || d.defect_status === 'Deferred'
      );
      if (filters.domain) {
        filtered = filtered.filter(
          (d) => d.domain === filters.domain || d.domainName === filters.domain
        );
      }
      if (filters.application) {
        filtered = filtered.filter(
          (d) =>
            d.application === filters.application ||
            d.applicationName === filters.application ||
            d.app_name === filters.application
        );
      }

      if (filtered.length === 0) {
        return;
      }

      const headers = ['ID', 'Summary', 'Severity', 'Priority', 'Domain', 'Application', 'Status', 'Created Date', 'Reason'];
      const rows = filtered.map((d) => [
        d.id || d.issue_id || '',
        d.summary || d.title || '',
        d.severity || '',
        d.priority || '',
        d.domain || d.domainName || '',
        d.application || d.applicationName || d.app_name || '',
        d.status || d.defect_status || '',
        d.createdDate || d.created_date || '',
        d.deferral_reason || d.reason || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deferred_defects_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[DeferredDefectsPage] Export failed:', err);
    }
  }, [filters]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning-50">
            <Clock className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Deferred Defects</h1>
            <p className="text-sm text-surface-500">
              Track and manage deferred defects across domains and applications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      <DeferredDefectsTable key={refreshKey} filters={filters} />
    </div>
  );
}

DeferredDefectsPage.propTypes = {};