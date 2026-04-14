// Application-wide constants and configuration values

// ─── Role Definitions ────────────────────────────────────────────────────────
export const ROLES = {
  VIEW_ONLY: 'engineer',
  TEST_LEAD: 'lead',
  ADMIN: 'manager',
}

export const ROLE_LABELS = {
  [ROLES.VIEW_ONLY]: 'Engineer',
  [ROLES.TEST_LEAD]: 'Test Lead',
  [ROLES.ADMIN]: 'Manager',
}

export const ROLE_HIERARCHY = [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN]

// ─── localStorage Keys ──────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'qe_hub_auth_token',
  USER_ROLE: 'qe_hub_user_role',
  USER_PREFERENCES: 'qe_hub_user_preferences',
  SIDEBAR_COLLAPSED: 'qe_hub_sidebar_collapsed',
  SELECTED_PROJECT: 'qe_hub_selected_project',
  SELECTED_ENVIRONMENT: 'qe_hub_selected_environment',
  THEME: 'qe_hub_theme',
  FILTERS: 'qe_hub_filters',
  QUICK_LINKS: 'qe_hub_quick_links',
  RECENT_SEARCHES: 'qe_hub_recent_searches',
}

// ─── RAG Status Options ─────────────────────────────────────────────────────
export const RAG_STATUS = {
  RED: 'red',
  AMBER: 'amber',
  GREEN: 'green',
  NOT_SET: 'not_set',
}

export const RAG_STATUS_LABELS = {
  [RAG_STATUS.RED]: 'Red',
  [RAG_STATUS.AMBER]: 'Amber',
  [RAG_STATUS.GREEN]: 'Green',
  [RAG_STATUS.NOT_SET]: 'Not Set',
}

export const RAG_STATUS_OPTIONS = [
  { value: RAG_STATUS.GREEN, label: 'Green' },
  { value: RAG_STATUS.AMBER, label: 'Amber' },
  { value: RAG_STATUS.RED, label: 'Red' },
  { value: RAG_STATUS.NOT_SET, label: 'Not Set' },
]

// ─── Severity Levels ────────────────────────────────────────────────────────
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
}

export const SEVERITY_LABELS = {
  [SEVERITY.CRITICAL]: 'Critical',
  [SEVERITY.HIGH]: 'High',
  [SEVERITY.MEDIUM]: 'Medium',
  [SEVERITY.LOW]: 'Low',
  [SEVERITY.INFO]: 'Info',
}

export const SEVERITY_OPTIONS = [
  { value: SEVERITY.CRITICAL, label: 'Critical' },
  { value: SEVERITY.HIGH, label: 'High' },
  { value: SEVERITY.MEDIUM, label: 'Medium' },
  { value: SEVERITY.LOW, label: 'Low' },
  { value: SEVERITY.INFO, label: 'Info' },
]

// ─── Environment Types ──────────────────────────────────────────────────────
export const ENVIRONMENTS = {
  SIT: 'sit',
  UAT: 'uat',
  PRE_PROD: 'pre-prod',
  PROD: 'prod',
}

export const ENVIRONMENT_LABELS = {
  [ENVIRONMENTS.SIT]: 'SIT',
  [ENVIRONMENTS.UAT]: 'UAT',
  [ENVIRONMENTS.PRE_PROD]: 'Pre-prod',
  [ENVIRONMENTS.PROD]: 'Prod',
}

export const ENVIRONMENT_OPTIONS = [
  { value: ENVIRONMENTS.SIT, label: 'SIT' },
  { value: ENVIRONMENTS.UAT, label: 'UAT' },
  { value: ENVIRONMENTS.PRE_PROD, label: 'Pre-prod' },
  { value: ENVIRONMENTS.PROD, label: 'Prod' },
]

// ─── Default Filter Values ──────────────────────────────────────────────────
export const DEFAULT_FILTERS = {
  environment: '',
  ragStatus: '',
  severity: '',
  dateRange: 'last_30_days',
  searchQuery: '',
  page: 1,
  pageSize: 20,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
}

export const DATE_RANGE_OPTIONS = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_14_days', label: 'Last 14 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ─── Navigation Menu Structure ──────────────────────────────────────────────
export const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    roles: [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'FolderKanban',
    roles: [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'defects',
    label: 'Defects',
    path: '/defects',
    icon: 'Bug',
    roles: [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'test-execution',
    label: 'Test Execution',
    path: '/test-execution',
    icon: 'PlayCircle',
    roles: [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'uploads',
    label: 'Uploads',
    path: '/uploads',
    icon: 'Upload',
    roles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    roles: [ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'quick-links',
    label: 'Quick Links',
    path: '/quick-links',
    icon: 'Link',
    roles: [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN],
  },
  {
    key: 'audit-log',
    label: 'Audit Log',
    path: '/audit-log',
    icon: 'ScrollText',
    roles: [ROLES.ADMIN],
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: [ROLES.ADMIN],
  },
]

// ─── Chart Color Mappings ───────────────────────────────────────────────────
export const CHART_COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  accent: '#14b8a6',
  accentLight: '#2dd4bf',
  accentDark: '#0d9488',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  neutral: '#64748b',
  neutralLight: '#94a3b8',
}

export const RAG_COLORS = {
  [RAG_STATUS.RED]: '#ef4444',
  [RAG_STATUS.AMBER]: '#f59e0b',
  [RAG_STATUS.GREEN]: '#22c55e',
  [RAG_STATUS.NOT_SET]: '#94a3b8',
}

export const SEVERITY_COLORS = {
  [SEVERITY.CRITICAL]: '#dc2626',
  [SEVERITY.HIGH]: '#ef4444',
  [SEVERITY.MEDIUM]: '#f59e0b',
  [SEVERITY.LOW]: '#3b82f6',
  [SEVERITY.INFO]: '#64748b',
}

export const ENVIRONMENT_COLORS = {
  [ENVIRONMENTS.SIT]: '#8b5cf6',
  [ENVIRONMENTS.UAT]: '#3b82f6',
  [ENVIRONMENTS.PRE_PROD]: '#f59e0b',
  [ENVIRONMENTS.PROD]: '#22c55e',
}

export const CHART_PALETTE = [
  '#6366f1',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#22c55e',
  '#f97316',
  '#06b6d4',
]

// ─── Defect Status Options ──────────────────────────────────────────────────
export const DEFECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  FIXED: 'fixed',
  VERIFIED: 'verified',
  CLOSED: 'closed',
  REOPENED: 'reopened',
  DEFERRED: 'deferred',
}

export const DEFECT_STATUS_LABELS = {
  [DEFECT_STATUS.OPEN]: 'Open',
  [DEFECT_STATUS.IN_PROGRESS]: 'In Progress',
  [DEFECT_STATUS.FIXED]: 'Fixed',
  [DEFECT_STATUS.VERIFIED]: 'Verified',
  [DEFECT_STATUS.CLOSED]: 'Closed',
  [DEFECT_STATUS.REOPENED]: 'Reopened',
  [DEFECT_STATUS.DEFERRED]: 'Deferred',
}

// ─── Test Execution Status ──────────────────────────────────────────────────
export const TEST_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  BLOCKED: 'blocked',
  NOT_RUN: 'not_run',
  IN_PROGRESS: 'in_progress',
  SKIPPED: 'skipped',
}

export const TEST_STATUS_LABELS = {
  [TEST_STATUS.PASS]: 'Pass',
  [TEST_STATUS.FAIL]: 'Fail',
  [TEST_STATUS.BLOCKED]: 'Blocked',
  [TEST_STATUS.NOT_RUN]: 'Not Run',
  [TEST_STATUS.IN_PROGRESS]: 'In Progress',
  [TEST_STATUS.SKIPPED]: 'Skipped',
}

export const TEST_STATUS_COLORS = {
  [TEST_STATUS.PASS]: '#22c55e',
  [TEST_STATUS.FAIL]: '#ef4444',
  [TEST_STATUS.BLOCKED]: '#f59e0b',
  [TEST_STATUS.NOT_RUN]: '#94a3b8',
  [TEST_STATUS.IN_PROGRESS]: '#3b82f6',
  [TEST_STATUS.SKIPPED]: '#64748b',
}

// ─── API Endpoints ──────────────────────────────────────────────────────────
export const API_ROUTES = {
  DASHBOARD: '/api/dashboard',
  PROJECTS: '/api/projects',
  DEFECTS: '/api/defects',
  TEST_EXECUTION: '/api/test-execution',
  UPLOADS: '/api/uploads',
  QUICK_LINKS: '/api/quick-links',
  AUDIT_LOG: '/api/audit-log',
  SETTINGS: '/api/settings',
  EMBEDDINGS: '/api/embeddings',
  ACCESS_CONTROL: '/api/access-control',
}

// ─── Misc Constants ─────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const ACCEPTED_FILE_TYPES = ['.csv', '.xlsx', '.xls', '.json']
export const DEBOUNCE_DELAY_MS = 300
export const TOAST_DURATION_MS = 5000
export const AUTO_REFRESH_INTERVAL_MS = 60000

export const DEFAULT_ROLE = import.meta.env.VITE_DEFAULT_ROLE || ROLES.VIEW_ONLY