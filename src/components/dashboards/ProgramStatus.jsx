import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Activity,
  TrendingUp,
  Bug,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  BarChart3,
  Layers,
  Target,
} from 'lucide-react';
import DataTable from '../common/DataTable';
import ChartCard from '../common/ChartCard';
import MetricCard from '../common/MetricCard';
import FilterBar from '../common/FilterBar';
import RAGStatusBadge from '../common/RAGStatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { getMockData } from '../../constants/mockData';
import {
  DOMAINS,
  PROGRAMS,
  RAG_OPTIONS,
  CHART_COLORS,
} from '../../constants/constants';
import { formatPercentage, formatNumber, formatDate } from '../../utils/formatUtils';
import { filterData } from '../../utils/filterUtils';
import { buildTrendData, getChartColor } from '../../utils/chartUtils';

const DRILL_LEVELS = {
  PROGRAM: 'program',
  WR: 'wr',
  APPLICATION: 'application',
};

/**
 * Aggregates program-level status data from mock data sources.
 * @returns {Array<object>} Program status records
 */
function getProgramStatusData() {
  const data = getMockData();
  const programStatuses = data.programStatuses || [];
  return programStatuses;
}

/**
 * Gets WR-level data for a given program.
 * @param {string} programId
 * @returns {Array<object>}
 */
function getWRDataForProgram(programId) {
  const data = getMockData();
  const releaseReadiness = data.releaseReadiness || [];
  return releaseReadiness.filter(
    (rr) => rr.programId === programId || rr.program === programId
  );
}

/**
 * Gets application-level data for a given WR.
 * @param {string} wrId
 * @returns {Array<object>}
 */
function getApplicationDataForWR(wrId) {
  const data = getMockData();
  const sitSummaries = data.sitSummaries || [];
  return sitSummaries.filter(
    (ss) => ss.wrId === wrId || ss.wrNumber === wrId
  );
}

/**
 * Builds defect trend data from defect density records.
 * @param {string} entityId
 * @returns {Array<object>}
 */
function getDefectTrendData(entityId) {
  const data = getMockData();
  const defectDensity = data.defectDensity || [];
  const filtered = entityId
    ? defectDensity.filter(
        (d) =>
          d.programId === entityId ||
          d.wrId === entityId ||
          d.applicationId === entityId ||
          d.program === entityId
      )
    : defectDensity;

  if (filtered.length === 0) {
    return [
      { period: 'Week 1', open: 12, resolved: 8, closed: 5 },
      { period: 'Week 2', open: 15, resolved: 12, closed: 9 },
      { period: 'Week 3', open: 10, resolved: 14, closed: 12 },
      { period: 'Week 4', open: 7, resolved: 11, closed: 15 },
      { period: 'Week 5', open: 5, resolved: 9, closed: 18 },
    ];
  }

  return buildTrendData(filtered, 'period', 'count', 'status');
}

/**
 * Builds test execution trend data.
 * @param {string} entityId
 * @returns {Array<object>}
 */
function getExecutionTrendData(entityId) {
  const data = getMockData();
  const trends = data.monthlyTrends || [];
  const filtered = entityId
    ? trends.filter(
        (t) =>
          t.programId === entityId ||
          t.program === entityId ||
          t.wrId === entityId
      )
    : trends;

  if (filtered.length === 0) {
    return [
      { period: 'Week 1', passed: 65, failed: 20, blocked: 10, notRun: 5 },
      { period: 'Week 2', passed: 72, failed: 15, blocked: 8, notRun: 5 },
      { period: 'Week 3', passed: 80, failed: 10, blocked: 6, notRun: 4 },
      { period: 'Week 4', passed: 88, failed: 7, blocked: 3, notRun: 2 },
      { period: 'Week 5', passed: 92, failed: 5, blocked: 2, notRun: 1 },
    ];
  }

  return filtered.map((t) => ({
    period: t.period || t.month || t.week,
    passed: t.passed || t.testsPassed || 0,
    failed: t.failed || t.testsFailed || 0,
    blocked: t.blocked || t.testsBlocked || 0,
    notRun: t.notRun || t.testsNotRun || 0,
  }));
}

/**
 * Builds coverage data for charts.
 * @param {Array<object>} records
 * @returns {Array<object>}
 */
function buildCoverageChartData(records) {
  if (!records || records.length === 0) return [];
  return records.map((r) => ({
    name: r.program || r.wrNumber || r.application || r.name || 'Unknown',
    coverage: r.testCoverage || r.coverage || 0,
    execution: r.executionPercentage || r.execution || 0,
  }));
}

const programColumns = [
  {
    key: 'program',
    header: 'Program',
    sortable: true,
    render: (value) => (
      <span className="font-medium text-surface-900">{value}</span>
    ),
  },
  {
    key: 'domain',
    header: 'Domain',
    sortable: true,
  },
  {
    key: 'ragStatus',
    header: 'RAG Status',
    sortable: true,
    render: (value) => <RAGStatusBadge status={value} size="sm" />,
  },
  {
    key: 'totalWRs',
    header: 'Total WRs',
    sortable: true,
    render: (value) => formatNumber(value),
  },
  {
    key: 'testCoverage',
    header: 'Test Coverage',
    sortable: true,
    render: (value) => (
      <span
        className={`font-medium ${
          value >= 90
            ? 'text-success-600'
            : value >= 70
            ? 'text-warning-600'
            : 'text-danger-600'
        }`}
      >
        {formatPercentage(value)}
      </span>
    ),
  },
  {
    key: 'executionPercentage',
    header: 'Execution %',
    sortable: true,
    render: (value) => (
      <span
        className={`font-medium ${
          value >= 90
            ? 'text-success-600'
            : value >= 70
            ? 'text-warning-600'
            : 'text-danger-600'
        }`}
      >
        {formatPercentage(value)}
      </span>
    ),
  },
  {
    key: 'totalDefects',
    header: 'Total Defects',
    sortable: true,
    render: (value) => formatNumber(value),
  },
  {
    key: 'openDefects',
    header: 'Open Defects',
    sortable: true,
    render: (value) => (
      <span className={value > 0 ? 'text-danger-600 font-medium' : 'text-surface-600'}>
        {formatNumber(value)}
      </span>
    ),
  },
  {
    key: 'timeline',
    header: 'Timeline',
    sortable: true,
    render: (value, row) => (
      <span className="text-sm text-surface-600">
        {formatDate(row.startDate)} — {formatDate(row.endDate)}
      </span>
    ),
  },
];

const wrColumns = [
  {
    key: 'wrNumber',
    header: 'WR Number',
    sortable: true,
    render: (value) => (
      <span className="font-medium text-brand-600">{value}</span>
    ),
  },
  {
    key: 'application',
    header: 'Application',
    sortable: true,
  },
  {
    key: 'ragStatus',
    header: 'RAG Status',
    sortable: true,
    render: (value) => <RAGStatusBadge status={value} size="sm" />,
  },
  {
    key: 'testCoverage',
    header: 'Test Coverage',
    sortable: true,
    render: (value) => (
      <span
        className={`font-medium ${
          value >= 90
            ? 'text-success-600'
            : value >= 70
            ? 'text-warning-600'
            : 'text-danger-600'
        }`}
      >
        {formatPercentage(value)}
      </span>
    ),
  },
  {
    key: 'executionPercentage',
    header: 'Execution %',
    sortable: true,
    render: (value) => formatPercentage(value),
  },
  {
    key: 'totalTestCases',
    header: 'Total Tests',
    sortable: true,
    render: (value) => formatNumber(value),
  },
  {
    key: 'totalDefects',
    header: 'Total Defects',
    sortable: true,
    render: (value) => formatNumber(value),
  },
  {
    key: 'openDefects',
    header: 'Open Defects',
    sortable: true,
    render: (value) => (
      <span className={value > 0 ? 'text-danger-600 font-medium' : 'text-surface-600'}>
        {formatNumber(value)}
      </span>
    ),
  },
  {
    key: 'confidenceIndex',
    header: 'Confidence',
    sortable: true,
    render: (value) => {
      const numVal = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(numVal)) return '—';
      return (
        <span
          className={`font-medium ${
            numVal >= 8
              ? 'text-success-600'
              : numVal >= 6
              ? 'text-warning-600'
              : 'text-danger-600'
          }`}
        >
          {numVal.toFixed(1)}
        </span>
      );
    },
  },
];

const applicationColumns = [
  {
    key: 'application',
    header: 'Application',
    sortable: true,
    render: (value) => (
      <span className="font-medium text-surface-900">{value}</span>
    ),
  },
  {
    key: 'environment',
    header: 'Environment',
    sortable: true,
  },
  {
    key: 'ragStatus',
    header: 'RAG Status',
    sortable: true,
    render: (value) => <RAGStatusBadge status={value} size="sm" />,
  },
  {
    key: 'totalTestCases',
    header: 'Total Tests',
    sortable: true,
    render: (value) => formatNumber(value),
  },
  {
    key: 'passed',
    header: 'Passed',
    sortable: true,
    render: (value) => (
      <span className="text-success-600 font-medium">{formatNumber(value)}</span>
    ),
  },
  {
    key: 'failed',
    header: 'Failed',
    sortable: true,
    render: (value) => (
      <span className={value > 0 ? 'text-danger-600 font-medium' : 'text-surface-600'}>
        {formatNumber(value)}
      </span>
    ),
  },
  {
    key: 'blocked',
    header: 'Blocked',
    sortable: true,
    render: (value) => (
      <span className={value > 0 ? 'text-warning-600 font-medium' : 'text-surface-600'}>
        {formatNumber(value)}
      </span>
    ),
  },
  {
    key: 'totalDefects',
    header: 'Total Defects',
    sortable: true,
    render: (value) => formatNumber(value),
  },
  {
    key: 'openDefects',
    header: 'Open Defects',
    sortable: true,
    render: (value) => (
      <span className={value > 0 ? 'text-danger-600 font-medium' : 'text-surface-600'}>
        {formatNumber(value)}
      </span>
    ),
  },
];

const filterConfigs = [
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
    name: 'ragStatus',
    label: 'RAG Status',
    defaultValue: '',
    options: [
      { label: 'All Statuses', value: '' },
      ...(RAG_OPTIONS || [
        { label: 'Green', value: 'Green' },
        { label: 'Amber', value: 'Amber' },
        { label: 'Red', value: 'Red' },
      ]),
    ],
  },
];

/**
 * Computes summary metrics from program status data.
 * @param {Array<object>} data
 * @returns {object}
 */
function computeMetrics(data) {
  if (!data || data.length === 0) {
    return {
      totalPrograms: 0,
      avgCoverage: 0,
      avgExecution: 0,
      totalDefects: 0,
      openDefects: 0,
      greenCount: 0,
      amberCount: 0,
      redCount: 0,
    };
  }

  const totalPrograms = data.length;
  const avgCoverage =
    data.reduce((sum, d) => sum + (d.testCoverage || 0), 0) / totalPrograms;
  const avgExecution =
    data.reduce((sum, d) => sum + (d.executionPercentage || 0), 0) / totalPrograms;
  const totalDefects = data.reduce((sum, d) => sum + (d.totalDefects || 0), 0);
  const openDefects = data.reduce((sum, d) => sum + (d.openDefects || 0), 0);
  const greenCount = data.filter(
    (d) => (d.ragStatus || '').toLowerCase() === 'green'
  ).length;
  const amberCount = data.filter(
    (d) => (d.ragStatus || '').toLowerCase() === 'amber'
  ).length;
  const redCount = data.filter(
    (d) => (d.ragStatus || '').toLowerCase() === 'red'
  ).length;

  return {
    totalPrograms,
    avgCoverage,
    avgExecution,
    totalDefects,
    openDefects,
    greenCount,
    amberCount,
    redCount,
  };
}

/**
 * Breadcrumb navigation component for drill-down levels.
 */
function Breadcrumb({ items, onNavigate }) {
  return (
    <nav className="flex items-center space-x-1 text-sm mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.key} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-surface-400 mx-1" />
          )}
          {index < items.length - 1 ? (
            <button
              onClick={() => onNavigate(item)}
              className="text-brand-600 hover:text-brand-700 hover:underline font-medium transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-surface-700 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      level: PropTypes.string.isRequired,
    })
  ).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

/**
 * ProgramStatus - Program-level status component with drill-down
 * from Program → WR → Application, showing timelines, test coverage,
 * execution %, total testing, defects, and trend charts.
 */
export default function ProgramStatus() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ domain: '', ragStatus: '' });
  const [drillLevel, setDrillLevel] = useState(DRILL_LEVELS.PROGRAM);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedWR, setSelectedWR] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([
    { key: 'programs', label: 'All Programs', level: DRILL_LEVELS.PROGRAM },
  ]);

  const programData = useMemo(() => {
    const raw = getProgramStatusData();
    if (raw.length === 0) {
      return [
        {
          id: 'ps-1',
          program: 'QE Automation',
          domain: 'Digital Banking',
          ragStatus: 'Green',
          totalWRs: 8,
          testCoverage: 92.5,
          executionPercentage: 88.3,
          totalDefects: 24,
          openDefects: 3,
          startDate: '2024-01-15',
          endDate: '2024-06-30',
        },
        {
          id: 'ps-2',
          program: 'Payment Gateway',
          domain: 'Payments',
          ragStatus: 'Amber',
          totalWRs: 12,
          testCoverage: 78.2,
          executionPercentage: 72.1,
          totalDefects: 45,
          openDefects: 12,
          startDate: '2024-02-01',
          endDate: '2024-07-15',
        },
        {
          id: 'ps-3',
          program: 'Lending Platform',
          domain: 'Lending',
          ragStatus: 'Red',
          totalWRs: 6,
          testCoverage: 65.0,
          executionPercentage: 55.8,
          totalDefects: 38,
          openDefects: 18,
          startDate: '2024-03-01',
          endDate: '2024-08-30',
        },
        {
          id: 'ps-4',
          program: 'Card Management',
          domain: 'Cards',
          ragStatus: 'Green',
          totalWRs: 10,
          testCoverage: 95.1,
          executionPercentage: 91.7,
          totalDefects: 15,
          openDefects: 1,
          startDate: '2024-01-01',
          endDate: '2024-05-31',
        },
        {
          id: 'ps-5',
          program: 'Core Banking Upgrade',
          domain: 'Core Banking',
          ragStatus: 'Amber',
          totalWRs: 15,
          testCoverage: 82.4,
          executionPercentage: 76.9,
          totalDefects: 52,
          openDefects: 9,
          startDate: '2024-02-15',
          endDate: '2024-09-30',
        },
      ];
    }
    return raw;
  }, []);

  const filteredProgramData = useMemo(() => {
    let result = programData;
    if (filters.domain) {
      result = result.filter((d) => d.domain === filters.domain);
    }
    if (filters.ragStatus) {
      result = result.filter((d) => d.ragStatus === filters.ragStatus);
    }
    return result;
  }, [programData, filters]);

  const metrics = useMemo(
    () => computeMetrics(filteredProgramData),
    [filteredProgramData]
  );

  const wrData = useMemo(() => {
    if (!selectedProgram) return [];
    const raw = getWRDataForProgram(selectedProgram.id || selectedProgram.program);
    if (raw.length === 0) {
      return [
        {
          id: 'wr-1',
          wrNumber: 'WR-10001',
          application: 'Mobile App',
          ragStatus: 'Green',
          testCoverage: 94.2,
          executionPercentage: 90.5,
          totalTestCases: 320,
          totalDefects: 8,
          openDefects: 1,
          confidenceIndex: 8.9,
          programId: selectedProgram.id,
        },
        {
          id: 'wr-2',
          wrNumber: 'WR-10002',
          application: 'Web Portal',
          ragStatus: 'Amber',
          testCoverage: 82.1,
          executionPercentage: 75.3,
          totalTestCases: 450,
          totalDefects: 15,
          openDefects: 5,
          confidenceIndex: 7.2,
          programId: selectedProgram.id,
        },
        {
          id: 'wr-3',
          wrNumber: 'WR-10003',
          application: 'API Gateway',
          ragStatus: 'Green',
          testCoverage: 91.8,
          executionPercentage: 88.7,
          totalTestCases: 280,
          totalDefects: 6,
          openDefects: 0,
          confidenceIndex: 9.1,
          programId: selectedProgram.id,
        },
      ];
    }
    return raw;
  }, [selectedProgram]);

  const applicationData = useMemo(() => {
    if (!selectedWR) return [];
    const raw = getApplicationDataForWR(selectedWR.id || selectedWR.wrNumber);
    if (raw.length === 0) {
      return [
        {
          id: 'app-1',
          application: 'Auth Service',
          environment: 'SIT',
          ragStatus: 'Green',
          totalTestCases: 120,
          passed: 110,
          failed: 5,
          blocked: 3,
          totalDefects: 5,
          openDefects: 1,
        },
        {
          id: 'app-2',
          application: 'Payment Processor',
          environment: 'SIT',
          ragStatus: 'Amber',
          totalTestCases: 95,
          passed: 72,
          failed: 12,
          blocked: 8,
          totalDefects: 12,
          openDefects: 4,
        },
        {
          id: 'app-3',
          application: 'Notification Engine',
          environment: 'SIT',
          ragStatus: 'Green',
          totalTestCases: 65,
          passed: 60,
          failed: 3,
          blocked: 1,
          totalDefects: 3,
          openDefects: 0,
        },
      ];
    }
    return raw;
  }, [selectedWR]);

  const currentEntityId = useMemo(() => {
    if (drillLevel === DRILL_LEVELS.APPLICATION && selectedWR) {
      return selectedWR.id || selectedWR.wrNumber;
    }
    if (drillLevel === DRILL_LEVELS.WR && selectedProgram) {
      return selectedProgram.id || selectedProgram.program;
    }
    return null;
  }, [drillLevel, selectedProgram, selectedWR]);

  const defectTrend = useMemo(
    () => getDefectTrendData(currentEntityId),
    [currentEntityId]
  );

  const executionTrend = useMemo(
    () => getExecutionTrendData(currentEntityId),
    [currentEntityId]
  );

  const coverageChartData = useMemo(() => {
    if (drillLevel === DRILL_LEVELS.PROGRAM) {
      return buildCoverageChartData(filteredProgramData);
    }
    if (drillLevel === DRILL_LEVELS.WR) {
      return buildCoverageChartData(wrData);
    }
    return buildCoverageChartData(applicationData);
  }, [drillLevel, filteredProgramData, wrData, applicationData]);

  const ragDistribution = useMemo(() => {
    const source =
      drillLevel === DRILL_LEVELS.PROGRAM
        ? filteredProgramData
        : drillLevel === DRILL_LEVELS.WR
        ? wrData
        : applicationData;

    const counts = { Green: 0, Amber: 0, Red: 0 };
    source.forEach((item) => {
      const status = (item.ragStatus || '').charAt(0).toUpperCase() + (item.ragStatus || '').slice(1).toLowerCase();
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return [
      { name: 'Green', value: counts.Green, fill: '#22c55e' },
      { name: 'Amber', value: counts.Amber, fill: '#f59e0b' },
      { name: 'Red', value: counts.Red, fill: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [drillLevel, filteredProgramData, wrData, applicationData]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleProgramDrillDown = useCallback(
    (row) => {
      setSelectedProgram(row);
      setDrillLevel(DRILL_LEVELS.WR);
      setBreadcrumbs([
        { key: 'programs', label: 'All Programs', level: DRILL_LEVELS.PROGRAM },
        {
          key: row.id || row.program,
          label: row.program,
          level: DRILL_LEVELS.WR,
        },
      ]);
    },
    []
  );

  const handleWRDrillDown = useCallback(
    (row) => {
      setSelectedWR(row);
      setDrillLevel(DRILL_LEVELS.APPLICATION);
      setBreadcrumbs((prev) => [
        ...prev.slice(0, 2),
        {
          key: row.id || row.wrNumber,
          label: row.wrNumber,
          level: DRILL_LEVELS.APPLICATION,
        },
      ]);
    },
    []
  );

  const handleBreadcrumbNavigate = useCallback((item) => {
    if (item.level === DRILL_LEVELS.PROGRAM) {
      setDrillLevel(DRILL_LEVELS.PROGRAM);
      setSelectedProgram(null);
      setSelectedWR(null);
      setBreadcrumbs([
        { key: 'programs', label: 'All Programs', level: DRILL_LEVELS.PROGRAM },
      ]);
    } else if (item.level === DRILL_LEVELS.WR) {
      setDrillLevel(DRILL_LEVELS.WR);
      setSelectedWR(null);
      setBreadcrumbs((prev) => prev.slice(0, 2));
    }
  }, []);

  const handleBack = useCallback(() => {
    if (drillLevel === DRILL_LEVELS.APPLICATION) {
      setDrillLevel(DRILL_LEVELS.WR);
      setSelectedWR(null);
      setBreadcrumbs((prev) => prev.slice(0, 2));
    } else if (drillLevel === DRILL_LEVELS.WR) {
      setDrillLevel(DRILL_LEVELS.PROGRAM);
      setSelectedProgram(null);
      setSelectedWR(null);
      setBreadcrumbs([
        { key: 'programs', label: 'All Programs', level: DRILL_LEVELS.PROGRAM },
      ]);
    }
  }, [drillLevel]);

  const programColumnsWithAction = useMemo(
    () => [
      ...programColumns,
      {
        key: '_actions',
        header: '',
        width: '60px',
        render: (_, row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProgramDrillDown(row);
            }}
            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
            aria-label={`Drill down into ${row.program}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [handleProgramDrillDown]
  );

  const wrColumnsWithAction = useMemo(
    () => [
      ...wrColumns,
      {
        key: '_actions',
        header: '',
        width: '60px',
        render: (_, row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWRDrillDown(row);
            }}
            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
            aria-label={`Drill down into ${row.wrNumber}`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [handleWRDrillDown]
  );

  const getRowId = useCallback(
    (row) => row.id || row.wrNumber || row.application || row.program,
    []
  );

  const levelTitle = useMemo(() => {
    if (drillLevel === DRILL_LEVELS.APPLICATION && selectedWR) {
      return `Application Status — ${selectedWR.wrNumber}`;
    }
    if (drillLevel === DRILL_LEVELS.WR && selectedProgram) {
      return `WR Status — ${selectedProgram.program}`;
    }
    return 'Program Status Overview';
  }, [drillLevel, selectedProgram, selectedWR]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading program status..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {drillLevel !== DRILL_LEVELS.PROGRAM && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{levelTitle}</h1>
            <p className="text-sm text-surface-500 mt-1">
              {drillLevel === DRILL_LEVELS.PROGRAM
                ? 'Program-level status with WR and application drill-down'
                : drillLevel === DRILL_LEVELS.WR
                ? 'Work request details and test execution status'
                : 'Application-level test execution and defect details'}
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <Breadcrumb items={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />
      )}

      {/* Filters - only at program level */}
      {drillLevel === DRILL_LEVELS.PROGRAM && (
        <FilterBar filters={filterConfigs} onChange={handleFilterChange} />
      )}

      {/* Metric Cards */}
      {drillLevel === DRILL_LEVELS.PROGRAM && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Programs"
            value={metrics.totalPrograms}
            icon={Layers}
          />
          <MetricCard
            title="Avg Coverage"
            value={formatPercentage(metrics.avgCoverage)}
            icon={Target}
            trend={metrics.avgCoverage >= 85 ? 'up' : 'down'}
            trendValue={formatPercentage(metrics.avgCoverage)}
          />
          <MetricCard
            title="Avg Execution"
            value={formatPercentage(metrics.avgExecution)}
            icon={Activity}
            trend={metrics.avgExecution >= 80 ? 'up' : 'down'}
            trendValue={formatPercentage(metrics.avgExecution)}
          />
          <MetricCard
            title="Open Defects"
            value={formatNumber(metrics.openDefects)}
            icon={Bug}
            trend={metrics.openDefects > 10 ? 'down' : 'up'}
            trendValue={`${metrics.openDefects} of ${metrics.totalDefects}`}
          />
        </div>
      )}

      {/* RAG Summary Cards for drill-down levels */}
      {drillLevel !== DRILL_LEVELS.PROGRAM && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Green"
            value={ragDistribution.find((d) => d.name === 'Green')?.value || 0}
            icon={CheckCircle2}
          />
          <MetricCard
            title="Amber"
            value={ragDistribution.find((d) => d.name === 'Amber')?.value || 0}
            icon={Activity}
          />
          <MetricCard
            title="Red"
            value={ragDistribution.find((d) => d.name === 'Red')?.value || 0}
            icon={Bug}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAG Distribution */}
        <ChartCard
          title="RAG Status Distribution"
          type="pie"
          data={ragDistribution}
          dataKey="value"
          nameKey="name"
          colors={['#22c55e', '#f59e0b', '#ef4444']}
        />

        {/* Coverage & Execution */}
        {coverageChartData.length > 0 && (
          <ChartCard
            title="Coverage vs Execution"
            type="bar"
            data={coverageChartData}
            dataKey="coverage"
            xAxisKey="name"
            series={[
              { dataKey: 'coverage', name: 'Test Coverage' },
              { dataKey: 'execution', name: 'Execution %' },
            ]}
            colors={[CHART_COLORS.primary, CHART_COLORS.accent]}
          />
        )}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Defect Trend"
          type="line"
          data={defectTrend}
          xAxisKey="period"
          series={[
            { dataKey: 'open', name: 'Open' },
            { dataKey: 'resolved', name: 'Resolved' },
            { dataKey: 'closed', name: 'Closed' },
          ]}
          colors={['#ef4444', '#f59e0b', '#22c55e']}
        />

        <ChartCard
          title="Test Execution Trend"
          type="stackedBar"
          data={executionTrend}
          xAxisKey="period"
          series={[
            { dataKey: 'passed', name: 'Passed' },
            { dataKey: 'failed', name: 'Failed' },
            { dataKey: 'blocked', name: 'Blocked' },
            { dataKey: 'notRun', name: 'Not Run' },
          ]}
          colors={['#22c55e', '#ef4444', '#f59e0b', '#94a3b8']}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-surface-900">
            {drillLevel === DRILL_LEVELS.PROGRAM
              ? 'Program Details'
              : drillLevel === DRILL_LEVELS.WR
              ? 'Work Request Details'
              : 'Application Details'}
          </h2>
        </div>

        {drillLevel === DRILL_LEVELS.PROGRAM && (
          <DataTable
            columns={programColumnsWithAction}
            data={filteredProgramData}
            loading={loading}
            sortable
            paginated
            getRowId={getRowId}
          />
        )}

        {drillLevel === DRILL_LEVELS.WR && (
          <DataTable
            columns={wrColumnsWithAction}
            data={wrData}
            loading={loading}
            sortable
            paginated
            getRowId={getRowId}
          />
        )}

        {drillLevel === DRILL_LEVELS.APPLICATION && (
          <DataTable
            columns={applicationColumns}
            data={applicationData}
            loading={loading}
            sortable
            paginated
            getRowId={getRowId}
          />
        )}
      </div>
    </div>
  );
}