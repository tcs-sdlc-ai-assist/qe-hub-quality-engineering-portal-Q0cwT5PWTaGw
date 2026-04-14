import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Search,
  AlertCircle,
  Building2,
  FolderKanban,
  FileText,
  Layers,
} from 'lucide-react';
import DashboardService from '../../services/DashboardService';
import EditableFieldManager from '../../services/EditableFieldManager';
import EditableFieldConfigManager from '../../services/EditableFieldConfigManager';
import { getMockData } from '../../constants/mockData';
import { ROLES } from '../../constants/constants';
import { formatDate, formatPercentage, formatNumber } from '../../utils/formatUtils';
import { getRAGColor } from '../../utils/filterUtils';
import RAGStatusBadge from '../common/RAGStatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import FilterBar from '../common/FilterBar';
import DataTable from '../common/DataTable';
import MetricCard from '../common/MetricCard';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

/**
 * Computes summary metrics from DSR program data
 * @param {Array<object>} data
 * @returns {object}
 */
function computeMetrics(data) {
  if (!data || data.length === 0) {
    return {
      totalPrograms: 0,
      totalWRs: 0,
      avgPassRate: 0,
      totalOpenDefects: 0,
      greenCount: 0,
      amberCount: 0,
      redCount: 0,
    };
  }

  const programSet = new Set();
  let wrCount = 0;
  let passRateSum = 0;
  let passRateCount = 0;
  let openDefects = 0;
  let greenCount = 0;
  let amberCount = 0;
  let redCount = 0;

  data.forEach((row) => {
    if (row.program) programSet.add(row.program);
    if (row.wrs && Array.isArray(row.wrs)) {
      wrCount += row.wrs.length;
      row.wrs.forEach((wr) => {
        if (wr.test_execution_pass_pct != null) {
          passRateSum += wr.test_execution_pass_pct;
          passRateCount += 1;
        }
        if (wr.open_defects != null) {
          openDefects += wr.open_defects;
        }
      });
    }
    if (row.test_execution_pass_pct != null) {
      passRateSum += row.test_execution_pass_pct;
      passRateCount += 1;
    }
    if (row.open_defects != null) {
      openDefects += row.open_defects;
    }
    const status = (row.rag_status || '').toUpperCase();
    if (status === 'GREEN') greenCount += 1;
    else if (status === 'AMBER') amberCount += 1;
    else if (status === 'RED') redCount += 1;
  });

  return {
    totalPrograms: programSet.size || data.length,
    totalWRs: wrCount,
    avgPassRate: passRateCount > 0 ? passRateSum / passRateCount : 0,
    totalOpenDefects: openDefects,
    greenCount,
    amberCount,
    redCount,
  };
}

/**
 * Inline editable cell for DSR fields
 */
function DSREditableCell({ value, field, rowId, rowData, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fieldConfig = EditableFieldConfigManager.getFieldConfig('dsr_program', field);
  const canEdit =
    fieldConfig &&
    fieldConfig.editable &&
    fieldConfig.allowedRoles &&
    fieldConfig.allowedRoles.includes(userRole);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await EditableFieldManager.updateField({
        rowId,
        fieldName: field,
        value: editValue,
        rowData,
      });
      if (onSave) {
        onSave({ rowId, fieldName: field, value: editValue });
      }
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!canEdit) {
    if (field === 'rag_status') {
      return <RAGStatusBadge status={value} />;
    }
    return <span className="text-surface-700">{value ?? '—'}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex items-center gap-1 text-left w-full hover:bg-brand-50 rounded px-1 py-0.5 transition-colors"
        title="Click to edit"
      >
        {field === 'rag_status' ? (
          <RAGStatusBadge status={value} />
        ) : (
          <span className="text-surface-700">{value ?? '—'}</span>
        )}
        <span className="opacity-0 group-hover:opacity-100 text-brand-500 text-xs ml-1">✎</span>
      </button>
    );
  }

  if (fieldConfig.type === 'select' && fieldConfig.options) {
    return (
      <div className="flex items-center gap-1">
        <select
          value={editValue || ''}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="border border-surface-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          autoFocus
        >
          {fieldConfig.options.map((opt) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-success-600 hover:text-success-700 text-xs font-medium px-1"
        >
          {saving ? '…' : '✓'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="text-danger-600 hover:text-danger-700 text-xs font-medium px-1"
        >
          ✕
        </button>
        {error && <span className="text-danger-600 text-xs">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type={fieldConfig.type === 'number' ? 'number' : 'text'}
        value={editValue ?? ''}
        onChange={(e) =>
          setEditValue(fieldConfig.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)
        }
        onKeyDown={handleKeyDown}
        disabled={saving}
        className="border border-surface-300 rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        autoFocus
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="text-success-600 hover:text-success-700 text-xs font-medium px-1"
      >
        {saving ? '…' : '✓'}
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={saving}
        className="text-danger-600 hover:text-danger-700 text-xs font-medium px-1"
      >
        ✕
      </button>
      {error && <span className="text-danger-600 text-xs">{error}</span>}
    </div>
  );
}

DSREditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  field: PropTypes.string.isRequired,
  rowId: PropTypes.string.isRequired,
  rowData: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

DSREditableCell.defaultProps = {
  value: null,
  onSave: null,
};

/**
 * Expandable WR row showing application-level details
 */
function WRExpandedRow({ wr }) {
  const applications = wr.applications || [];

  if (applications.length === 0) {
    return (
      <div className="px-6 py-3 text-surface-500 text-sm italic">
        No application-level data available for this WR.
      </div>
    );
  }

  return (
    <div className="px-6 py-3 bg-surface-50">
      <h5 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <Layers className="w-3 h-3" />
        Applications
      </h5>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-2 px-3 text-surface-600 font-medium">Application</th>
              <th className="text-left py-2 px-3 text-surface-600 font-medium">Test Cases</th>
              <th className="text-left py-2 px-3 text-surface-600 font-medium">Executed</th>
              <th className="text-left py-2 px-3 text-surface-600 font-medium">Pass %</th>
              <th className="text-left py-2 px-3 text-surface-600 font-medium">Open Defects</th>
              <th className="text-left py-2 px-3 text-surface-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, idx) => (
              <tr
                key={app.id || `app-${idx}`}
                className="border-b border-surface-100 last:border-b-0 hover:bg-white transition-colors"
              >
                <td className="py-2 px-3 text-surface-800 font-medium">{app.name || '—'}</td>
                <td className="py-2 px-3 text-surface-700">{formatNumber(app.total_test_cases)}</td>
                <td className="py-2 px-3 text-surface-700">{formatNumber(app.executed)}</td>
                <td className="py-2 px-3 text-surface-700">{formatPercentage(app.pass_pct)}</td>
                <td className="py-2 px-3 text-surface-700">{formatNumber(app.open_defects)}</td>
                <td className="py-2 px-3">
                  <RAGStatusBadge status={app.rag_status || app.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

WRExpandedRow.propTypes = {
  wr: PropTypes.object.isRequired,
};

/**
 * Expandable program row showing WR-level details
 */
function ProgramExpandedRow({ program, onFieldSave }) {
  const [expandedWRs, setExpandedWRs] = useState({});
  const wrs = program.wrs || [];

  const toggleWR = useCallback((wrId) => {
    setExpandedWRs((prev) => ({ ...prev, [wrId]: !prev[wrId] }));
  }, []);

  if (wrs.length === 0) {
    return (
      <div className="px-6 py-3 text-surface-500 text-sm italic">
        No WR-level data available for this program.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-surface-50">
      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <FileText className="w-3 h-3" />
        Work Requests
      </h4>
      <div className="space-y-1">
        {wrs.map((wr, idx) => {
          const wrId = wr.id || wr.wr_number || `wr-${idx}`;
          const isExpanded = expandedWRs[wrId] || false;

          return (
            <div
              key={wrId}
              className="bg-white rounded-lg border border-surface-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleWR(wrId)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-surface-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
                )}
                <span className="font-medium text-surface-800 text-sm min-w-[120px]">
                  {wr.wr_number || wrId}
                </span>
                <span className="text-surface-600 text-sm flex-1">{wr.description || wr.name || ''}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-surface-500">
                    Pass: <span className="font-medium text-surface-700">{formatPercentage(wr.test_execution_pass_pct)}</span>
                  </span>
                  <span className="text-surface-500">
                    Open: <span className="font-medium text-surface-700">{formatNumber(wr.open_defects)}</span>
                  </span>
                  <DSREditableCell
                    value={wr.rag_status}
                    field="rag_status"
                    rowId={wrId}
                    rowData={wr}
                    onSave={onFieldSave}
                  />
                </div>
              </button>
              {isExpanded && <WRExpandedRow wr={wr} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

ProgramExpandedRow.propTypes = {
  program: PropTypes.object.isRequired,
  onFieldSave: PropTypes.func,
};

ProgramExpandedRow.defaultProps = {
  onFieldSave: null,
};

/**
 * ProgramDSR - Program-level Daily Status Report with drill-down
 */
export default function ProgramDSR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await DashboardService.getDSRProgram(filters);
      let dsrData = [];

      if (result && Array.isArray(result)) {
        dsrData = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        dsrData = result.data;
      } else {
        const mockData = getMockData();
        if (mockData && mockData.dsrProgram && Array.isArray(mockData.dsrProgram)) {
          dsrData = mockData.dsrProgram;
        } else if (mockData && mockData.programStatus && Array.isArray(mockData.programStatus)) {
          dsrData = mockData.programStatus.map((ps) => ({
            id: ps.id,
            program: ps.program || ps.name,
            domain: ps.domain,
            rag_status: ps.ragStatus || ps.rag_status || 'Green',
            test_execution_pass_pct: ps.testExecutionPassPct || ps.test_execution_pass_pct || 0,
            total_defects: ps.totalDefects || ps.total_defects || 0,
            open_defects: ps.openDefects || ps.open_defects || 0,
            confidence_index: ps.confidenceIndex || ps.confidence_index || 0,
            comments: ps.comments || '',
            wrs: ps.wrs || [],
          }));
        }
      }

      setData(dsrData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch program DSR data');
      const mockData = getMockData();
      if (mockData && mockData.programStatus && Array.isArray(mockData.programStatus)) {
        setData(
          mockData.programStatus.map((ps) => ({
            id: ps.id,
            program: ps.program || ps.name,
            domain: ps.domain,
            rag_status: ps.ragStatus || ps.rag_status || 'Green',
            test_execution_pass_pct: ps.testExecutionPassPct || ps.test_execution_pass_pct || 0,
            total_defects: ps.totalDefects || ps.total_defects || 0,
            open_defects: ps.openDefects || ps.open_defects || 0,
            confidence_index: ps.confidenceIndex || ps.confidence_index || 0,
            comments: ps.comments || '',
            wrs: ps.wrs || [],
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterConfig = useMemo(() => {
    const domains = [...new Set(data.map((d) => d.domain).filter(Boolean))];
    const statuses = ['Green', 'Amber', 'Red'];

    return [
      {
        name: 'domain',
        label: 'Domain',
        defaultValue: '',
        options: [
          { label: 'All Domains', value: '' },
          ...domains.map((d) => ({ label: d, value: d })),
        ],
      },
      {
        name: 'rag_status',
        label: 'RAG Status',
        defaultValue: '',
        options: [
          { label: 'All Statuses', value: '' },
          ...statuses.map((s) => ({ label: s, value: s })),
        ],
      },
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.domain) {
      result = result.filter((row) => row.domain === filters.domain);
    }

    if (filters.rag_status) {
      result = result.filter(
        (row) =>
          (row.rag_status || '').toLowerCase() === filters.rag_status.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (row) =>
          (row.program || '').toLowerCase().includes(term) ||
          (row.domain || '').toLowerCase().includes(term) ||
          (row.comments || '').toLowerCase().includes(term)
      );
    }

    return result;
  }, [data, filters, searchTerm]);

  const metrics = useMemo(() => computeMetrics(filteredData), [filteredData]);

  const toggleProgram = useCallback((programId) => {
    setExpandedPrograms((prev) => ({ ...prev, [programId]: !prev[programId] }));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleFieldSave = useCallback(
    ({ rowId, fieldName, value }) => {
      setData((prev) =>
        prev.map((row) => {
          const id = row.id || row.program;
          if (id === rowId) {
            return { ...row, [fieldName]: value };
          }
          if (row.wrs && Array.isArray(row.wrs)) {
            const updatedWRs = row.wrs.map((wr) => {
              const wrId = wr.id || wr.wr_number;
              if (wrId === rowId) {
                return { ...wr, [fieldName]: value };
              }
              return wr;
            });
            return { ...row, wrs: updatedWRs };
          }
          return row;
        })
      );
    },
    []
  );

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = useCallback(() => {
    try {
      const rows = filteredData.map((row) => ({
        Program: row.program || '',
        Domain: row.domain || '',
        'RAG Status': row.rag_status || '',
        'Pass %': row.test_execution_pass_pct != null ? row.test_execution_pass_pct : '',
        'Total Defects': row.total_defects != null ? row.total_defects : '',
        'Open Defects': row.open_defects != null ? row.open_defects : '',
        'Confidence Index': row.confidence_index != null ? row.confidence_index : '',
        Comments: row.comments || '',
      }));

      const headers = Object.keys(rows[0] || {});
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          headers
            .map((h) => {
              const val = String(row[h] || '');
              return val.includes(',') ? `"${val}"` : val;
            })
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `program-dsr-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[ProgramDSR] Export failed:', err);
    }
  }, [filteredData]);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading Program DSR..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-brand-600" />
            Program DSR
          </h2>
          <p className="text-surface-500 text-sm mt-1">
            Program-level Daily Status Report with WR and Application drill-down
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-surface-400">
              Updated: {formatDate(lastRefresh.toISOString())}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors shadow-soft disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-soft disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto text-danger-600 hover:text-danger-800 font-medium text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Programs"
          value={metrics.totalPrograms}
          icon={FolderKanban}
        />
        <MetricCard
          title="Total WRs"
          value={metrics.totalWRs}
          icon={FileText}
        />
        <MetricCard
          title="Avg Pass Rate"
          value={formatPercentage(metrics.avgPassRate)}
        />
        <MetricCard
          title="Open Defects"
          value={metrics.totalOpenDefects}
        />
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-500" />
            <span className="text-sm font-medium text-surface-700">{metrics.greenCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning-500" />
            <span className="text-sm font-medium text-surface-700">{metrics.amberCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger-500" />
            <span className="text-sm font-medium text-surface-700">{metrics.redCount}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1 w-full">
          <FilterBar filters={filterConfig} onChange={handleFilterChange} />
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-soft"
          />
        </div>
      </div>

      {/* Program Table with Drill-down */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <Building2 className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-surface-700 mb-1">No Programs Found</h3>
          <p className="text-surface-500 text-sm">
            {data.length === 0
              ? 'No program DSR data is available.'
              : 'Try adjusting your filters or search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map((program, idx) => {
            const programId = program.id || program.program || `prg-${idx}`;
            const isExpanded = expandedPrograms[programId] || false;

            return (
              <div
                key={programId}
                className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                {/* Program Header Row */}
                <button
                  type="button"
                  onClick={() => toggleProgram(programId)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-50 transition-colors text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-brand-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-surface-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span className="font-semibold text-surface-900 truncate">
                        {program.program || program.name || programId}
                      </span>
                    </div>
                    {program.domain && (
                      <span className="text-xs text-surface-500 mt-0.5 block">
                        {program.domain}
                      </span>
                    )}
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-sm flex-shrink-0">
                    <div className="text-center">
                      <div className="text-xs text-surface-400 mb-0.5">Pass Rate</div>
                      <div className="font-semibold text-surface-800">
                        {formatPercentage(program.test_execution_pass_pct)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-surface-400 mb-0.5">Total Defects</div>
                      <div className="font-semibold text-surface-800">
                        {formatNumber(program.total_defects)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-surface-400 mb-0.5">Open</div>
                      <div className="font-semibold text-surface-800">
                        {formatNumber(program.open_defects)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-surface-400 mb-0.5">Confidence</div>
                      <div className="font-semibold text-surface-800">
                        {program.confidence_index != null ? program.confidence_index : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <DSREditableCell
                      value={program.rag_status}
                      field="rag_status"
                      rowId={programId}
                      rowData={program}
                      onSave={handleFieldSave}
                    />
                  </div>
                </button>

                {/* Editable Fields Row (visible when expanded) */}
                {isExpanded && (
                  <div className="border-t border-surface-100">
                    <div className="px-6 py-3 bg-surface-50 flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-surface-500 font-medium">Confidence Index:</span>
                        <DSREditableCell
                          value={program.confidence_index}
                          field="confidence_index"
                          rowId={programId}
                          rowData={program}
                          onSave={handleFieldSave}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-1 min-w-[200px]">
                        <span className="text-surface-500 font-medium">Comments:</span>
                        <DSREditableCell
                          value={program.comments}
                          field="comments"
                          rowId={programId}
                          rowData={program}
                          onSave={handleFieldSave}
                        />
                      </div>
                    </div>
                    <ProgramExpandedRow
                      program={program}
                      onFieldSave={handleFieldSave}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {filteredData.length > 0 && (
        <div className="text-xs text-surface-400 text-right">
          Showing {filteredData.length} of {data.length} programs
        </div>
      )}
    </div>
  );
}