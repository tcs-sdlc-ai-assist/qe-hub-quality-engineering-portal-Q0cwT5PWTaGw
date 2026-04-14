import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  FolderOpen,
  AppWindow,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import DashboardService from '../../services/DashboardService';
import EditableFieldManager from '../../services/EditableFieldManager';
import EditableFieldConfigManager from '../../services/EditableFieldConfigManager';
import RAGStatusBadge from '../common/RAGStatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import FilterBar from '../common/FilterBar';
import { formatDate, formatNumber } from '../../utils/formatUtils';
import { getRAGColor } from '../../utils/formatUtils';
import { DOMAINS, ROLES } from '../../constants/constants';

const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

const EDITABLE_FIELDS = [
  'rag_status',
  'sit_signoff_date',
  'brd_dou_date',
  'trd_date',
  'code_drop_date',
  'tdm_request_number',
  'dependencies',
  'risks',
  'comments',
  'performance_testing',
  'perf_signoff_date',
  'dast_testing',
  'dast_signoff_date',
];

const FIELD_CONFIGS = {
  rag_status: {
    editable: true,
    type: 'select',
    allowedRoles: ['lead', 'manager'],
    options: [
      { value: 'Green', label: 'Green' },
      { value: 'Amber', label: 'Amber' },
      { value: 'Red', label: 'Red' },
    ],
  },
  sit_signoff_date: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  brd_dou_date: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  trd_date: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  code_drop_date: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  tdm_request_number: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  dependencies: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  risks: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  comments: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  performance_testing: {
    editable: true,
    type: 'select',
    allowedRoles: ['lead', 'manager'],
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'N/A', label: 'N/A' },
    ],
  },
  perf_signoff_date: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
  dast_testing: {
    editable: true,
    type: 'select',
    allowedRoles: ['lead', 'manager'],
    options: [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' },
      { value: 'N/A', label: 'N/A' },
    ],
  },
  dast_signoff_date: {
    editable: true,
    type: 'text',
    allowedRoles: ['lead', 'manager'],
    options: [],
  },
};

/**
 * Checks if the current user can edit a given field
 * @param {string} fieldName
 * @returns {boolean}
 */
function canEditField(fieldName) {
  const config = FIELD_CONFIGS[fieldName];
  if (!config || !config.editable) return false;
  return config.allowedRoles.includes(userRole);
}

/**
 * InlineEditableCell - renders an editable cell for DSR fields
 */
function InlineEditableCell({ value, fieldName, rowId, rowData, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const config = FIELD_CONFIGS[fieldName];
  const editable = canEditField(fieldName);

  const handleSave = useCallback(async () => {
    if (editValue === (value || '')) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await EditableFieldManager.updateField({
        rowId,
        fieldName,
        value: editValue,
        rowData,
      });
      if (onSave) {
        onSave({ rowId, fieldName, value: editValue });
      }
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [editValue, value, rowId, fieldName, rowData, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value || '');
    setEditing(false);
    setError(null);
  }, [value]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  if (!editable) {
    if (fieldName === 'rag_status') {
      return <RAGStatusBadge status={value || '—'} size="sm" />;
    }
    return <span className="text-sm text-surface-700">{value || '—'}</span>;
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {config && config.type === 'select' ? (
            <select
              className="rounded border border-surface-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saving}
              autoFocus
            >
              <option value="">Select...</option>
              {(config.options || []).map((opt) => {
                const optValue = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={optValue} value={optValue}>
                    {optLabel}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type="text"
              className="w-full rounded border border-surface-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saving}
              autoFocus
            />
          )}
          <button
            className="rounded bg-brand-600 px-2 py-1 text-xs text-white hover:bg-brand-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
            aria-label="Save"
          >
            {saving ? '...' : '✓'}
          </button>
          <button
            className="rounded bg-surface-200 px-2 py-1 text-xs text-surface-700 hover:bg-surface-300"
            onClick={handleCancel}
            disabled={saving}
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>
        {error && <span className="text-xs text-danger-600">{error}</span>}
      </div>
    );
  }

  return (
    <button
      className="group flex w-full items-center gap-1 text-left"
      onClick={() => {
        setEditValue(value || '');
        setEditing(true);
      }}
      title="Click to edit"
    >
      {fieldName === 'rag_status' ? (
        <RAGStatusBadge status={value || '—'} size="sm" />
      ) : (
        <span className="text-sm text-surface-700">{value || '—'}</span>
      )}
      <span className="ml-1 hidden text-xs text-brand-500 group-hover:inline">
        ✎
      </span>
    </button>
  );
}

InlineEditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fieldName: PropTypes.string.isRequired,
  rowId: PropTypes.string.isRequired,
  rowData: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

InlineEditableCell.defaultProps = {
  value: '',
  onSave: null,
};

/**
 * ApplicationRow - renders a single application-level row within a WR
 */
function ApplicationRow({ app, onFieldSave }) {
  const rowId = app.id || `app-${app.application}`;

  return (
    <tr className="border-b border-surface-100 bg-surface-50/50 hover:bg-surface-100/50">
      <td className="py-2 pl-16 pr-3 text-sm">
        <div className="flex items-center gap-2">
          <AppWindow className="h-3.5 w-3.5 text-surface-400" />
          <span className="text-surface-600">{app.application || '—'}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.rag_status}
          fieldName="rag_status"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2 text-sm text-surface-700">
        {formatNumber(app.total_tcs) || '—'}
      </td>
      <td className="px-3 py-2 text-sm text-surface-700">
        {formatNumber(app.executed_tcs) || '—'}
      </td>
      <td className="px-3 py-2 text-sm text-surface-700">
        {formatNumber(app.passed_tcs) || '—'}
      </td>
      <td className="px-3 py-2 text-sm text-surface-700">
        {formatNumber(app.failed_tcs) || '—'}
      </td>
      <td className="px-3 py-2 text-sm text-surface-700">
        {formatNumber(app.open_defects) || '—'}
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.sit_signoff_date}
          fieldName="sit_signoff_date"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.brd_dou_date}
          fieldName="brd_dou_date"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.trd_date}
          fieldName="trd_date"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.code_drop_date}
          fieldName="code_drop_date"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.tdm_request_number}
          fieldName="tdm_request_number"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.performance_testing}
          fieldName="performance_testing"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.perf_signoff_date}
          fieldName="perf_signoff_date"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.dast_testing}
          fieldName="dast_testing"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.dast_signoff_date}
          fieldName="dast_signoff_date"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.dependencies}
          fieldName="dependencies"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.risks}
          fieldName="risks"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
      <td className="px-3 py-2">
        <InlineEditableCell
          value={app.comments}
          fieldName="comments"
          rowId={rowId}
          rowData={app}
          onSave={onFieldSave}
        />
      </td>
    </tr>
  );
}

ApplicationRow.propTypes = {
  app: PropTypes.object.isRequired,
  onFieldSave: PropTypes.func,
};

ApplicationRow.defaultProps = {
  onFieldSave: null,
};

/**
 * WRRow - renders a WR-level row, expandable to show applications
 */
function WRRow({ wr, onFieldSave }) {
  const [expanded, setExpanded] = useState(false);
  const rowId = wr.id || `wr-${wr.wr_number}`;
  const applications = wr.applications || [];

  return (
    <>
      <tr
        className="cursor-pointer border-b border-surface-100 bg-white hover:bg-brand-50/30"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-2.5 pl-10 pr-3 text-sm font-medium">
          <div className="flex items-center gap-2">
            {applications.length > 0 ? (
              expanded ? (
                <ChevronDown className="h-4 w-4 text-brand-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-surface-400" />
              )
            ) : (
              <span className="inline-block w-4" />
            )}
            <FolderOpen className="h-4 w-4 text-brand-400" />
            <span className="text-surface-800">{wr.wr_number || '—'}</span>
          </div>
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.rag_status}
            fieldName="rag_status"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5 text-sm text-surface-700">
          {formatNumber(wr.total_tcs) || '—'}
        </td>
        <td className="px-3 py-2.5 text-sm text-surface-700">
          {formatNumber(wr.executed_tcs) || '—'}
        </td>
        <td className="px-3 py-2.5 text-sm text-surface-700">
          {formatNumber(wr.passed_tcs) || '—'}
        </td>
        <td className="px-3 py-2.5 text-sm text-surface-700">
          {formatNumber(wr.failed_tcs) || '—'}
        </td>
        <td className="px-3 py-2.5 text-sm text-surface-700">
          {formatNumber(wr.open_defects) || '—'}
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.sit_signoff_date}
            fieldName="sit_signoff_date"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.brd_dou_date}
            fieldName="brd_dou_date"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.trd_date}
            fieldName="trd_date"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.code_drop_date}
            fieldName="code_drop_date"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.tdm_request_number}
            fieldName="tdm_request_number"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.performance_testing}
            fieldName="performance_testing"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.perf_signoff_date}
            fieldName="perf_signoff_date"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.dast_testing}
            fieldName="dast_testing"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.dast_signoff_date}
            fieldName="dast_signoff_date"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.dependencies}
            fieldName="dependencies"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.risks}
            fieldName="risks"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <InlineEditableCell
            value={wr.comments}
            fieldName="comments"
            rowId={rowId}
            rowData={wr}
            onSave={onFieldSave}
          />
        </td>
      </tr>
      {expanded &&
        applications.map((app, idx) => (
          <ApplicationRow
            key={app.id || `${rowId}-app-${idx}`}
            app={app}
            onFieldSave={onFieldSave}
          />
        ))}
    </>
  );
}

WRRow.propTypes = {
  wr: PropTypes.object.isRequired,
  onFieldSave: PropTypes.func,
};

WRRow.defaultProps = {
  onFieldSave: null,
};

/**
 * DomainGroup - renders a domain-level expandable group
 */
function DomainGroup({ domain, onFieldSave }) {
  const [expanded, setExpanded] = useState(false);
  const wrs = domain.work_requests || [];

  const domainSummary = useMemo(() => {
    let totalTcs = 0;
    let executedTcs = 0;
    let passedTcs = 0;
    let failedTcs = 0;
    let openDefects = 0;

    wrs.forEach((wr) => {
      totalTcs += Number(wr.total_tcs) || 0;
      executedTcs += Number(wr.executed_tcs) || 0;
      passedTcs += Number(wr.passed_tcs) || 0;
      failedTcs += Number(wr.failed_tcs) || 0;
      openDefects += Number(wr.open_defects) || 0;
    });

    return { totalTcs, executedTcs, passedTcs, failedTcs, openDefects };
  }, [wrs]);

  return (
    <>
      <tr
        className="cursor-pointer border-b border-surface-200 bg-surface-50 hover:bg-brand-50/50"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 pl-4 pr-3 text-sm font-semibold">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-brand-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-surface-500" />
            )}
            <Building2 className="h-4 w-4 text-brand-500" />
            <span className="text-surface-900">{domain.domain_name}</span>
            <span className="ml-2 rounded-full bg-surface-200 px-2 py-0.5 text-xs text-surface-600">
              {wrs.length} WR{wrs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </td>
        <td className="px-3 py-3">
          <RAGStatusBadge status={domain.rag_status || '—'} size="sm" />
        </td>
        <td className="px-3 py-3 text-sm font-medium text-surface-800">
          {formatNumber(domainSummary.totalTcs)}
        </td>
        <td className="px-3 py-3 text-sm font-medium text-surface-800">
          {formatNumber(domainSummary.executedTcs)}
        </td>
        <td className="px-3 py-3 text-sm font-medium text-surface-800">
          {formatNumber(domainSummary.passedTcs)}
        </td>
        <td className="px-3 py-3 text-sm font-medium text-surface-800">
          {formatNumber(domainSummary.failedTcs)}
        </td>
        <td className="px-3 py-3 text-sm font-medium text-surface-800">
          {formatNumber(domainSummary.openDefects)}
        </td>
        <td className="px-3 py-3 text-sm text-surface-500" colSpan={11}>
          {expanded ? '' : 'Click to expand'}
        </td>
      </tr>
      {expanded &&
        wrs.map((wr, idx) => (
          <WRRow
            key={wr.id || `${domain.domain_name}-wr-${idx}`}
            wr={wr}
            onFieldSave={onFieldSave}
          />
        ))}
    </>
  );
}

DomainGroup.propTypes = {
  domain: PropTypes.object.isRequired,
  onFieldSave: PropTypes.func,
};

DomainGroup.defaultProps = {
  onFieldSave: null,
};

const TABLE_HEADERS = [
  { key: 'name', label: 'Domain / WR / Application', width: 'min-w-[220px]' },
  { key: 'rag_status', label: 'RAG Status', width: 'min-w-[100px]' },
  { key: 'total_tcs', label: 'Total TCs', width: 'min-w-[80px]' },
  { key: 'executed_tcs', label: 'Executed', width: 'min-w-[80px]' },
  { key: 'passed_tcs', label: 'Passed', width: 'min-w-[80px]' },
  { key: 'failed_tcs', label: 'Failed', width: 'min-w-[80px]' },
  { key: 'open_defects', label: 'Open Defects', width: 'min-w-[90px]' },
  { key: 'sit_signoff_date', label: 'SIT Sign-off', width: 'min-w-[110px]' },
  { key: 'brd_dou_date', label: 'BRD/DOU Date', width: 'min-w-[110px]' },
  { key: 'trd_date', label: 'TRD Date', width: 'min-w-[100px]' },
  { key: 'code_drop_date', label: 'Code Drop', width: 'min-w-[100px]' },
  { key: 'tdm_request_number', label: 'TDM Request#', width: 'min-w-[110px]' },
  { key: 'performance_testing', label: 'Perf Testing', width: 'min-w-[100px]' },
  { key: 'perf_signoff_date', label: 'Perf Sign-off', width: 'min-w-[110px]' },
  { key: 'dast_testing', label: 'DAST Testing', width: 'min-w-[100px]' },
  { key: 'dast_signoff_date', label: 'DAST Sign-off', width: 'min-w-[110px]' },
  { key: 'dependencies', label: 'Dependencies', width: 'min-w-[140px]' },
  { key: 'risks', label: 'Risks', width: 'min-w-[140px]' },
  { key: 'comments', label: 'Comments', width: 'min-w-[160px]' },
];

const domainOptions = (DOMAINS || [
  'Digital Banking',
  'Payments',
  'Lending',
  'Cards',
  'Core Banking',
]).map((d) => {
  const name = typeof d === 'object' ? d.label || d.value || d.name : d;
  return { label: name, value: name };
});

const ragOptions = [
  { label: 'All RAG', value: '' },
  { label: 'Green', value: 'Green' },
  { label: 'Amber', value: 'Amber' },
  { label: 'Red', value: 'Red' },
];

/**
 * DomainDSR - Domain-wise Daily Status Report with drill-down
 */
export default function DomainDSR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    domain: '',
    rag_status: '',
  });

  const dashboardService = useMemo(() => new DashboardService(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDSRDomain(filters);
      const dsrData = Array.isArray(result) ? result : result?.data || [];
      setData(dsrData);
    } catch (err) {
      console.error('[DomainDSR] Failed to fetch DSR domain data:', err);
      setError(err.message || 'Failed to load domain DSR data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dashboardService, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    let result = data;

    if (filters.domain) {
      result = result.filter(
        (d) =>
          d.domain_name &&
          d.domain_name.toLowerCase() === filters.domain.toLowerCase()
      );
    }

    if (filters.rag_status) {
      result = result.filter(
        (d) =>
          d.rag_status &&
          d.rag_status.toLowerCase() === filters.rag_status.toLowerCase()
      );
    }

    return result;
  }, [data, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleFieldSave = useCallback(
    ({ rowId, fieldName, value }) => {
      setData((prevData) => {
        return prevData.map((domain) => {
          const updatedWrs = (domain.work_requests || []).map((wr) => {
            if (wr.id === rowId || `wr-${wr.wr_number}` === rowId) {
              return { ...wr, [fieldName]: value };
            }
            const updatedApps = (wr.applications || []).map((app) => {
              if (
                app.id === rowId ||
                `app-${app.application}` === rowId
              ) {
                return { ...app, [fieldName]: value };
              }
              return app;
            });
            return { ...wr, applications: updatedApps };
          });
          return { ...domain, work_requests: updatedWrs };
        });
      });
    },
    []
  );

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const totalDomains = filteredData.length;
  const totalWRs = filteredData.reduce(
    (acc, d) => acc + (d.work_requests || []).length,
    0
  );

  const filterConfig = [
    {
      name: 'domain',
      label: 'Domain',
      defaultValue: '',
      options: [{ label: 'All Domains', value: '' }, ...domainOptions],
    },
    {
      name: 'rag_status',
      label: 'RAG Status',
      defaultValue: '',
      options: ragOptions,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Domain DSR..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900">
            Domain-wise Daily Status Report
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Drill down by Domain → WR → Application. {canEditField('rag_status') && 'Click fields to edit.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 shadow-soft transition-colors hover:bg-surface-50"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar filters={filterConfig} onChange={handleFilterChange} />

      {/* Summary Stats */}
      <div className="flex items-center gap-6 text-sm text-surface-600">
        <span>
          <span className="font-semibold text-surface-800">{totalDomains}</span>{' '}
          Domain{totalDomains !== 1 ? 's' : ''}
        </span>
        <span>
          <span className="font-semibold text-surface-800">{totalWRs}</span>{' '}
          Work Request{totalWRs !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4">
          <AlertTriangle className="h-5 w-5 text-danger-600" />
          <div>
            <p className="text-sm font-medium text-danger-800">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-1 text-sm text-danger-600 underline hover:text-danger-700"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px] table-auto">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header.key}
                    className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 ${header.width}`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="h-10 w-10 text-surface-300" />
                      <p className="text-sm font-medium text-surface-500">
                        No domain DSR data found
                      </p>
                      <p className="text-xs text-surface-400">
                        Try adjusting your filters or refresh the data
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((domain, idx) => (
                  <DomainGroup
                    key={domain.id || `dom-${idx}`}
                    domain={domain}
                    onFieldSave={handleFieldSave}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Info */}
      {canEditField('rag_status') && (
        <p className="text-xs text-surface-400">
          You are logged in as <span className="font-medium">{userRole}</span>.
          Editable fields are highlighted on hover.
        </p>
      )}
    </div>
  );
}