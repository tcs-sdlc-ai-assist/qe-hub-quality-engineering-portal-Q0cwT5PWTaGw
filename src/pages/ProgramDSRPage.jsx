import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ClipboardList, RefreshCw } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import ProgramDSR from '../components/dashboards/ProgramDSR';
import { getMockData } from '../constants/mockData';
import { PROGRAMS } from '../constants/constants';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

export default function ProgramDSRPage() {
  const [filters, setFilters] = useState({
    program: '',
    releaseDate: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const mockData = useMemo(() => getMockData(), []);

  const releaseDates = useMemo(() => {
    const dates = new Set();
    const programDsr = mockData.programDSR || [];
    programDsr.forEach((p) => {
      if (p.work_requests) {
        p.work_requests.forEach((wr) => {
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

  const programOptions = useMemo(() => {
    const programs = PROGRAMS && PROGRAMS.length > 0
      ? PROGRAMS
      : (mockData.programDSR || []).map((p) => p.program_name).filter(Boolean);
    const unique = [...new Set(programs)];
    return [
      { label: 'All Programs', value: '' },
      ...unique.map((p) => ({ label: p, value: p })),
    ];
  }, [mockData]);

  const filterConfig = useMemo(() => [
    {
      name: 'program',
      label: 'Program',
      defaultValue: '',
      options: programOptions,
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
  ], [programOptions, releaseDates]);

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
            <ClipboardList className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Program DSR</h1>
            <p className="text-sm text-surface-500">
              Program-level Daily Status Report with drill-down to Work Requests and Applications
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

      <ProgramDSR key={refreshKey} filters={filters} />

      {(userRole === 'manager' || userRole === 'lead') && (
        <div className="text-xs text-surface-400 text-right">
          Role: {userRole === 'manager' ? 'Manager' : 'Lead'} — Inline editing enabled for DSR fields
        </div>
      )}
    </div>
  );
}

ProgramDSRPage.propTypes = {};