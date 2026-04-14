import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Activity, RefreshCw } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import ProgramStatus from '../components/dashboards/ProgramStatus';
import { getMockData } from '../constants/mockData';
import { PROGRAMS } from '../constants/constants';

export default function ProgramStatusPage() {
  const [filters, setFilters] = useState({
    program: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const mockData = useMemo(() => getMockData(), []);

  const programOptions = useMemo(() => {
    const programs = PROGRAMS && PROGRAMS.length > 0
      ? PROGRAMS
      : (mockData.programStatus || []).map((p) => p.program_name || p.programName).filter(Boolean);
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
  ], [programOptions]);

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
            <Activity className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Program Status</h1>
            <p className="text-sm text-surface-500">
              Program-level status overview with drill-down to Work Requests, Applications, trends, and charts
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

      <ProgramStatus key={refreshKey} filters={filters} />
    </div>
  );
}

ProgramStatusPage.propTypes = {};