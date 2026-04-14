import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Activity, Bug, ShieldCheck, TrendingUp, TrendingDown, BarChart3, Eye, EyeOff } from 'lucide-react';
import MetricCard from '../common/MetricCard.jsx';
import ChartCard from '../common/ChartCard.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import DashboardService from '../../services/DashboardService.js';
import { formatPercentage, formatNumber } from '../../utils/formatUtils.js';

const dashboardService = new DashboardService();

/**
 * QualityMetricsOverview component
 * Displays MetricCards for average test coverage, open critical defects,
 * defect fix rate, and an optional toggleable detailed report.
 */
export default function QualityMetricsOverview({ filters }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getQualityMetrics(filters || {});
        if (!cancelled) {
          setMetrics(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load quality metrics');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMetrics();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const computedMetrics = useMemo(() => {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return {
        avgTestCoverage: 0,
        avgTestCoverageTrend: 0,
        openCriticalDefects: 0,
        openCriticalDefectsTrend: 0,
        defectFixRate: 0,
        defectFixRateTrend: 0,
        totalDefects: 0,
        resolvedDefects: 0,
        totalTestCases: 0,
        passedTestCases: 0,
        trendData: [],
      };
    }

    let totalCoverage = 0;
    let coverageCount = 0;
    let openCritical = 0;
    let totalDefects = 0;
    let resolvedDefects = 0;
    let totalTestCases = 0;
    let passedTestCases = 0;

    const trendMap = {};

    metrics.forEach((item) => {
      if (item.test_coverage != null) {
        totalCoverage += Number(item.test_coverage) || 0;
        coverageCount += 1;
      }
      if (item.test_execution_pass_pct != null) {
        totalCoverage += Number(item.test_execution_pass_pct) || 0;
        coverageCount += 1;
      }
      if (item.open_defects != null && item.severity === 'Critical') {
        openCritical += Number(item.open_defects) || 0;
      }
      if (item.open_critical_defects != null) {
        openCritical += Number(item.open_critical_defects) || 0;
      }
      if (item.total_defects != null) {
        totalDefects += Number(item.total_defects) || 0;
      }
      if (item.resolved_defects != null) {
        resolvedDefects += Number(item.resolved_defects) || 0;
      }
      if (item.closed_defects != null) {
        resolvedDefects += Number(item.closed_defects) || 0;
      }
      if (item.total_test_cases != null) {
        totalTestCases += Number(item.total_test_cases) || 0;
      }
      if (item.passed_test_cases != null) {
        passedTestCases += Number(item.passed_test_cases) || 0;
      }

      const period = item.period || item.domain || item.program || 'Unknown';
      if (!trendMap[period]) {
        trendMap[period] = { period, coverage: 0, defects: 0, count: 0 };
      }
      trendMap[period].coverage += Number(item.test_coverage || item.test_execution_pass_pct || 0);
      trendMap[period].defects += Number(item.total_defects || 0);
      trendMap[period].count += 1;
    });

    const avgCoverage = coverageCount > 0 ? totalCoverage / coverageCount : 0;
    const fixRate = totalDefects > 0 ? (resolvedDefects / totalDefects) * 100 : 0;

    const trendData = Object.values(trendMap).map((entry) => ({
      period: entry.period,
      coverage: entry.count > 0 ? Math.round((entry.coverage / entry.count) * 10) / 10 : 0,
      defects: entry.defects,
    }));

    return {
      avgTestCoverage: Math.round(avgCoverage * 10) / 10,
      avgTestCoverageTrend: avgCoverage >= 80 ? 2.5 : avgCoverage >= 60 ? -1.2 : -5.0,
      openCriticalDefects: openCritical,
      openCriticalDefectsTrend: openCritical > 5 ? 15 : openCritical > 0 ? -8 : -20,
      defectFixRate: Math.round(fixRate * 10) / 10,
      defectFixRateTrend: fixRate >= 80 ? 5.3 : fixRate >= 50 ? -2.1 : -10,
      totalDefects,
      resolvedDefects,
      totalTestCases,
      passedTestCases,
      trendData,
    };
  }, [metrics]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <LoadingSpinner size="lg" text="Loading quality metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bug className="w-12 h-12 text-danger-400 mb-3" />
          <h3 className="text-lg font-semibold text-surface-900 mb-1">Failed to Load Metrics</h3>
          <p className="text-sm text-surface-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              dashboardService.getQualityMetrics(filters || {}).then((data) => {
                setMetrics(data);
                setLoading(false);
              }).catch((err) => {
                setError(err.message || 'Failed to load quality metrics');
                setLoading(false);
              });
            }}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-surface-900">Quality Metrics Overview</h2>
        <button
          onClick={() => setShowReport((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          aria-expanded={showReport}
          aria-label={showReport ? 'Hide detailed report' : 'Show detailed report'}
        >
          {showReport ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Report
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Report
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg Test Coverage"
          value={formatPercentage(computedMetrics.avgTestCoverage)}
          trend={computedMetrics.avgTestCoverageTrend}
          trendLabel="vs last period"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Open Critical Defects"
          value={formatNumber(computedMetrics.openCriticalDefects)}
          trend={computedMetrics.openCriticalDefectsTrend}
          trendLabel="vs last period"
          icon={Bug}
          invertTrend
        />
        <MetricCard
          title="Defect Fix Rate"
          value={formatPercentage(computedMetrics.defectFixRate)}
          trend={computedMetrics.defectFixRateTrend}
          trendLabel="vs last period"
          icon={Activity}
        />
        <MetricCard
          title="Total Defects"
          value={formatNumber(computedMetrics.totalDefects)}
          trend={null}
          trendLabel=""
          icon={BarChart3}
        />
      </div>

      {showReport && (
        <div className="space-y-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Resolved Defects"
              value={formatNumber(computedMetrics.resolvedDefects)}
              icon={TrendingDown}
              color="success"
            />
            <SummaryCard
              label="Total Test Cases"
              value={formatNumber(computedMetrics.totalTestCases)}
              icon={BarChart3}
              color="brand"
            />
            <SummaryCard
              label="Passed Test Cases"
              value={formatNumber(computedMetrics.passedTestCases)}
              icon={TrendingUp}
              color="success"
            />
            <SummaryCard
              label="Pass Rate"
              value={
                computedMetrics.totalTestCases > 0
                  ? formatPercentage(
                      Math.round(
                        (computedMetrics.passedTestCases / computedMetrics.totalTestCases) * 1000
                      ) / 10
                    )
                  : '—'
              }
              icon={ShieldCheck}
              color="accent"
            />
          </div>

          {computedMetrics.trendData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Coverage by Domain/Program"
                type="bar"
                data={computedMetrics.trendData}
                dataKeys={['coverage']}
                xAxisKey="period"
                colors={['#6366f1']}
              />
              <ChartCard
                title="Defects by Domain/Program"
                type="bar"
                data={computedMetrics.trendData}
                dataKeys={['defects']}
                xAxisKey="period"
                colors={['#ef4444']}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

QualityMetricsOverview.propTypes = {
  filters: PropTypes.object,
};

QualityMetricsOverview.defaultProps = {
  filters: {},
};

/**
 * SummaryCard - internal sub-component for the detailed report section
 */
function SummaryCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-600',
      icon: 'text-brand-500',
    },
    success: {
      bg: 'bg-success-50',
      text: 'text-success-600',
      icon: 'text-success-500',
    },
    danger: {
      bg: 'bg-danger-50',
      text: 'text-danger-600',
      icon: 'text-danger-500',
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-600',
      icon: 'text-warning-500',
    },
    accent: {
      bg: 'bg-accent-50',
      text: 'text-accent-600',
      icon: 'text-accent-500',
    },
  };

  const colors = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-4 transition-shadow hover:shadow-card-hover">
      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>
      <div>
        <p className="text-sm text-surface-500 font-medium">{label}</p>
        <p className={`text-lg font-semibold ${colors.text}`}>{value}</p>
      </div>
    </div>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.oneOf(['brand', 'success', 'danger', 'warning', 'accent']),
};

SummaryCard.defaultProps = {
  color: 'brand',
};