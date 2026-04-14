import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  LayoutDashboard,
  Shield,
  Bug,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  FileText,
  Settings,
  ExternalLink,
  Zap,
  Target,
} from 'lucide-react';
import MetricCard from '../components/common/MetricCard';
import { getMockData } from '../constants/mockData';
import { NAV_ITEMS } from '../constants/constants';
import { formatDate } from '../utils/formatUtils';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

function QuickNavCard({ title, description, icon: Icon, path, color }) {
  const navigate = useNavigate();

  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    danger: 'bg-danger-50 text-danger-600 border-danger-200',
    accent: 'bg-teal-50 text-teal-600 border-teal-200',
  };

  const iconBgMap = {
    brand: 'bg-brand-100 text-brand-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600',
    accent: 'bg-teal-100 text-teal-600',
  };

  return (
    <button
      onClick={() => navigate(path)}
      className={`group relative flex flex-col items-start gap-3 rounded-xl border p-5 text-left shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${colorMap[color] || colorMap.brand}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgMap[color] || iconBgMap.brand}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
        <p className="mt-1 text-xs text-surface-500 line-clamp-2">{description}</p>
      </div>
      <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-surface-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-surface-600" />
    </button>
  );
}

QuickNavCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  path: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['brand', 'success', 'warning', 'danger', 'accent']),
};

QuickNavCard.defaultProps = {
  color: 'brand',
};

function ActivityItem({ action, entity, timestamp, user }) {
  const actionColors = {
    edit: 'bg-brand-100 text-brand-700',
    create: 'bg-success-100 text-success-700',
    delete: 'bg-danger-100 text-danger-700',
    upload: 'bg-teal-100 text-teal-700',
    config: 'bg-warning-100 text-warning-700',
  };

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-surface-50">
      <span className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[action] || 'bg-surface-100 text-surface-600'}`}>
        {action}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-surface-800 truncate">{entity}</p>
        <p className="text-xs text-surface-400">
          {user} · {formatDate(timestamp)}
        </p>
      </div>
    </div>
  );
}

ActivityItem.propTypes = {
  action: PropTypes.string.isRequired,
  entity: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
};

export default function WelcomePage() {
  const [metrics, setMetrics] = useState({
    totalDefects: 0,
    criticalDefects: 0,
    openDefects: 0,
    passRate: 0,
    totalPrograms: 0,
    atRiskReleases: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = getMockData();

      const defects = data.defects || data.defectDetails || [];
      const releaseReadiness = data.releaseReadiness || [];
      const programs = data.programs || data.programStatus || [];

      const totalDefects = defects.length;
      const criticalDefects = defects.filter((d) => d.severity === 'Critical').length;
      const openDefects = defects.filter((d) => d.status === 'Open' || d.status === 'In Progress' || d.status === 'Reopened').length;

      let passRate = 0;
      if (releaseReadiness.length > 0) {
        const totalPassed = releaseReadiness.reduce((sum, r) => sum + (r.passed_tcs || r.passedTCs || 0), 0);
        const totalExecuted = releaseReadiness.reduce((sum, r) => sum + (r.executed_tcs || r.executedTCs || 0), 0);
        passRate = totalExecuted > 0 ? Math.round((totalPassed / totalExecuted) * 100) : 0;
      }

      const totalPrograms = programs.length || 5;
      const atRiskReleases = releaseReadiness.filter(
        (r) => (r.status || r.rag_status) === 'At Risk' || (r.status || r.rag_status) === 'Critical' || (r.status || r.rag_status) === 'Red'
      ).length;

      setMetrics({
        totalDefects,
        criticalDefects,
        openDefects,
        passRate,
        totalPrograms,
        atRiskReleases,
      });

      const auditLogs = data.auditLogs || [];
      const sortedLogs = [...auditLogs]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 8)
        .map((log) => ({
          action: log.action || 'edit',
          entity: log.fieldName ? `${log.entityType || 'Record'} - ${log.fieldName}` : log.entityType || 'Record',
          timestamp: log.timestamp || new Date().toISOString(),
          user: log.user || 'QE User',
        }));

      if (sortedLogs.length === 0) {
        setRecentActivity([
          { action: 'edit', entity: 'Release Readiness - RAG Status', timestamp: new Date().toISOString(), user: 'QE User' },
          { action: 'upload', entity: 'SIT Defect Data - Q4 Release', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'QE Lead' },
          { action: 'create', entity: 'Program Status - Digital Banking', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'QE Manager' },
          { action: 'edit', entity: 'Domain DSR - Payments WR-2024', timestamp: new Date(Date.now() - 10800000).toISOString(), user: 'QE User' },
          { action: 'config', entity: 'Admin - Editable Fields Config', timestamp: new Date(Date.now() - 14400000).toISOString(), user: 'QE Manager' },
        ]);
      } else {
        setRecentActivity(sortedLogs);
      }
    } catch (err) {
      console.error('[WelcomePage] Error loading data:', err);
    }
  }, []);

  const quickNavItems = useMemo(
    () => [
      {
        title: 'Release Readiness',
        description: 'Track release status, quality gates, and readiness metrics across programs.',
        icon: Target,
        path: '/release-readiness',
        color: 'brand',
      },
      {
        title: 'Showstopper Defects',
        description: 'Monitor critical and showstopper defects blocking releases.',
        icon: AlertTriangle,
        path: '/showstopper-defects',
        color: 'danger',
      },
      {
        title: 'SIT Defect Summary',
        description: 'View SIT defect trends, severity distribution, and domain breakdown.',
        icon: Bug,
        path: '/sit-defect-summary',
        color: 'warning',
      },
      {
        title: 'Domain DSR',
        description: 'Daily status reports by domain with WR-level drill-down.',
        icon: FileText,
        path: '/domain-dsr',
        color: 'accent',
      },
      {
        title: 'Program DSR',
        description: 'Program-level daily status with confidence index tracking.',
        icon: BarChart3,
        path: '/program-dsr',
        color: 'success',
      },
      {
        title: 'Defect Analytics',
        description: 'Trend charts, RCA analysis, and environment distribution insights.',
        icon: TrendingUp,
        path: '/defect-trends',
        color: 'brand',
      },
    ],
    []
  );

  const prevPassRate = metrics.passRate > 0 ? metrics.passRate - 2 : 0;
  const passRateTrend = metrics.passRate >= prevPassRate ? 'up' : 'down';
  const passRateTrendValue = Math.abs(metrics.passRate - prevPassRate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to QE Hub</h1>
            <p className="mt-1 text-brand-100">
              Quality Engineering Dashboard — Centralized visibility into release quality, defect tracking, and program status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Clock className="h-4 w-4" />
              {formatDate(new Date().toISOString())}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Defects"
          value={metrics.totalDefects}
          icon={Bug}
        />
        <MetricCard
          title="Critical Defects"
          value={metrics.criticalDefects}
          icon={AlertTriangle}
          trend={metrics.criticalDefects > 0 ? 'up' : undefined}
          trendValue={metrics.criticalDefects}
          invertTrend
        />
        <MetricCard
          title="Open Defects"
          value={metrics.openDefects}
          icon={Zap}
        />
        <MetricCard
          title="Test Pass Rate"
          value={`${metrics.passRate}%`}
          icon={CheckCircle}
          trend={passRateTrend}
          trendValue={passRateTrendValue}
        />
        <MetricCard
          title="Programs"
          value={metrics.totalPrograms}
          icon={Activity}
        />
        <MetricCard
          title="At Risk Releases"
          value={metrics.atRiskReleases}
          icon={Shield}
          trend={metrics.atRiskReleases > 0 ? 'up' : undefined}
          trendValue={metrics.atRiskReleases}
          invertTrend
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-surface-900">Quick Navigation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickNavItems.map((item) => (
            <QuickNavCard key={item.path} {...item} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-surface-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">Getting Started</h2>
            <LayoutDashboard className="h-5 w-5 text-surface-400" />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-surface-50 p-4">
              <h3 className="text-sm font-semibold text-surface-800">📊 Dashboard Overview</h3>
              <p className="mt-1 text-sm text-surface-600">
                QE Hub provides centralized visibility into quality engineering metrics across all programs and domains.
                Navigate using the sidebar to access release readiness, defect tracking, DSR reports, and analytics.
              </p>
            </div>
            <div className="rounded-lg bg-surface-50 p-4">
              <h3 className="text-sm font-semibold text-surface-800">🔍 Key Features</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-surface-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                  Release readiness tracking with quality gates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                  Real-time defect monitoring and trend analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                  Domain and program-level daily status reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                  RCA analysis and environment distribution charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                  Inline editing for leads and managers
                </li>
              </ul>
            </div>
            {(userRole === 'manager' || userRole === 'lead') && (
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
                <h3 className="text-sm font-semibold text-brand-800">⚙️ Admin Access</h3>
                <p className="mt-1 text-sm text-brand-600">
                  As a {userRole}, you have access to inline editing, data uploads, and configuration management.
                </p>
                {userRole === 'manager' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Open Admin Panel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">Recent Activity</h2>
            <Clock className="h-5 w-5 text-surface-400" />
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-1">
              {recentActivity.map((item, idx) => (
                <ActivityItem key={`${item.timestamp}-${idx}`} {...item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-8 w-8 text-surface-300" />
              <p className="mt-2 text-sm text-surface-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}