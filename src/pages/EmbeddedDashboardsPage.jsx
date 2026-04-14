import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { MonitorDot, BarChart3, GitBranch } from 'lucide-react';
import EmbeddingDashboard from '../components/embedding/EmbeddingDashboard';

const DASHBOARD_TABS = [
  {
    key: 'elastic-testing',
    label: 'Testing Readiness',
    icon: MonitorDot,
    source: 'ELASTIC',
    dashboardId: 'testing-readiness',
    title: 'Elastic Testing Readiness Dashboard',
    description: 'Real-time testing readiness metrics and environment health from Elastic.',
  },
  {
    key: 'jira-devsecops',
    label: 'DevSecOps Roadmap',
    icon: GitBranch,
    source: 'JIRA',
    dashboardId: 'devsecops-roadmap',
    title: 'Jira DevSecOps Roadmap',
    description: 'DevSecOps pipeline progress and security compliance tracking from Jira.',
  },
  {
    key: 'jira-epic',
    label: 'Epic Progress',
    icon: BarChart3,
    source: 'JIRA',
    dashboardId: 'epic-progress',
    title: 'Jira Epic Progress Dashboard',
    description: 'Epic-level progress tracking and sprint velocity from Jira.',
  },
];

function TabButton({ tabKey, label, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(tabKey)}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
        isActive
          ? 'bg-brand-600 text-white shadow-soft'
          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 border border-surface-200'
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

export default function EmbeddedDashboardsPage() {
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS[0].key);

  const handleTabClick = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  const activeConfig = DASHBOARD_TABS.find((tab) => tab.key === activeTab) || DASHBOARD_TABS[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Embedded Dashboards</h1>
        <p className="text-sm text-surface-500 mt-1">
          Access external dashboards from Elastic and Jira directly within the QE Hub.
        </p>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {DASHBOARD_TABS.map((tab) => (
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

      <div className="bg-white rounded-xl shadow-card border border-surface-200 p-4 animate-fade-in">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-surface-900">{activeConfig.title}</h2>
          <p className="text-sm text-surface-500 mt-1">{activeConfig.description}</p>
        </div>
        <EmbeddingDashboard
          key={activeConfig.key}
          source={activeConfig.source}
          dashboardId={activeConfig.dashboardId}
        />
      </div>
    </div>
  );
}