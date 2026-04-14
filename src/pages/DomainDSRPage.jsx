import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FileText, RefreshCw } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import DomainDSR from '../components/dashboards/DomainDSR';
import { getMockData } from '../constants/mockData';
import { DOMAINS } from '../constants/constants';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

export default function DomainDSRPage() {
  const [filters, setFilters] = useState({
    domain: '',
    releaseDate: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const mockData = useMemo(() => getMockData(), []);

  const releaseDates = useMemo(() => {
    const dates = new Set();
    const domainDsr = mockData.domainDSR || [];
    domainDsr.forEach((d) => {
      if (d.work_requests) {
        d.work_requests.forEach((wr) => {
          if (wr.sit_signoff_date) dates.add(wr.sit_signoff_date);
          if (wr.code_drop_date) dates.add(wr.code_drop_date);
        });
      }
    });
    const releaseReadiness = mockData.releaseReadiness || [];
    releaseReadiness.forEach((r) => {
      if (r.releaseDate) dates.add(r.releaseDate);
      if (r.release_date) dates.add(r.release_date);
    });
    return [...dates].sort().reverse();
  }, [mockData]);

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
      name: 'releaseDate',
      label: 'Release Date',
      defaultValue: '',
      options: [
        { label: 'All Dates', value: '' },
        ...releaseDates.map((d) => ({ label: d, value: d })),
      ],
    },
  ], [releaseDates]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50">
            <FileText className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Domain DSR</h1>
            <p className="text-sm text-surface-500">
              Domain-wise Daily Status Report with drill-down to Work Requests and Applications
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      <DomainDSR key={refreshKey} filters={filters} />

      {userRole === 'manager' && (
        <div className="text-xs text-surface-400 text-right">
          Role: Manager — Inline editing enabled for DSR fields
        </div>
      )}
      {userRole === 'lead' && (
        <div className="text-xs text-surface-400 text-right">
          Role: Lead — Inline editing enabled for DSR fields
        </div>
      )}
    </div>
  );
}

DomainDSRPage.propTypes = {};