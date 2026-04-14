import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';
import FilterBar from '../components/common/FilterBar';
import MonthlyTrends from '../components/analytics/MonthlyTrends';
import DefectTrendCharts from '../components/analytics/DefectTrendCharts';
import SeverityDistribution from '../components/analytics/SeverityDistribution';
import EnvironmentDistribution from '../components/analytics/EnvironmentDistribution';
import RCACharts from '../components/analytics/RCACharts';
import { getMockData } from '../constants/mockData';
import { DOMAINS } from '../constants/constants';

const TABS = [
  { key: 'trends', label: 'Monthly Trends', icon: TrendingUp },
  { key: 'defects', label: 'Defect Trends', icon: BarChart3 },
  { key: 'severity', label: 'Severity Distribution', icon: BarChart3 },
  { key: 'environment', label: 'Environment Distribution', icon: BarChart3 },
  { key: 'rca', label: 'Root Cause Analysis', icon: BarChart3 },
];

function TabButton({ tabKey, label, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(tabKey)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-brand-600 text-white shadow-soft'
          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

TabButton.propTypes = {
  tabKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function QualityMetricsPage() {
  const [activeTab, setActiveTab] = useState('trends');
  const [filters, setFilters] = useState({ domain: '', application: '' });

  const mockData = useMemo(() => getMockData(), []);

  const domainOptions = useMemo(() => {
    const domains = DOMAINS && DOMAINS.length > 0
      ? DOMAINS.map((d) => (typeof d === 'string' ? d : d.label || d.value))
      : ['Digital Banking', 'Payments', 'Lending', 'Cards', 'Core Banking'];
    return [
      { label: 'All Domains', value: '' },
      ...domains.map((d) => ({ label: d, value: d })),
    ];
  }, []);

  const applicationOptions = useMemo(() => {
    const defects = mockData.defects || mockData.defectDetails || [];
    let apps = [...new Set(defects.map((d) => d.application).filter(Boolean))];
    if (filters.domain) {
      const filtered = defects.filter((d) => d.domain === filters.domain);
      apps = [...new Set(filtered.map((d) => d.application).filter(Boolean))];
    }
    return [
      { label: 'All Applications', value: '' },
      ...apps.map((a) => ({ label: a, value: a })),
    ];
  }, [mockData, filters.domain]);

  const filterConfig = useMemo(
    () => [
      {
        name: 'domain',
        label: 'Domain',
        defaultValue: '',
        options: domainOptions,
      },
      {
        name: 'application',
        label: 'Application',
        defaultValue: '',
        options: applicationOptions,
      },
    ],
    [domainOptions, applicationOptions]
  );

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => {
      if (newFilters.domain !== undefined && newFilters.domain !== prev.domain) {
        return { ...newFilters, application: '' };
      }
      return newFilters;
    });
  }, []);

  const handleTabClick = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const filteredDefects = useMemo(() => {
    const defects = mockData.defects || mockData.defectDetails || [];
    return defects.filter((d) => {
      if (filters.domain && d.domain !== filters.domain) return false;
      if (filters.application && d.application !== filters.application) return false;
      return true;
    });
  }, [mockData, filters]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'trends':
        return <MonthlyTrends className="animate-fade-in" />;
      case 'defects':
        return <DefectTrendCharts defects={filteredDefects} className="animate-fade-in" />;
      case 'severity':
        return <SeverityDistribution defects={filteredDefects} className="animate-fade-in" />;
      case 'environment':
        return <EnvironmentDistribution defects={filteredDefects} className="animate-fade-in" />;
      case 'rca':
        return <RCACharts defects={filteredDefects} className="animate-fade-in" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quality Metrics & Trends</h1>
          <p className="text-sm text-surface-500 mt-1">
            Analyze quality metrics, defect trends, and root cause distributions across domains and applications.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Filter size={16} />
          <span>
            {filters.domain || 'All Domains'}
            {filters.application ? ` / ${filters.application}` : ''}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-surface-200 p-4">
        <FilterBar filters={filterConfig} onChange={handleFilterChange} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tabKey={tab.key}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.key}
            onClick={handleTabClick}
          />
        ))}
      </div>

      <div className="min-h-[400px]">{renderActiveTab()}</div>
    </div>
  );
}