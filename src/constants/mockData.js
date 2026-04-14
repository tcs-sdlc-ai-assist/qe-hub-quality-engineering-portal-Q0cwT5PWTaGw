// src/constants/mockData.js
// Comprehensive mock data seed for localStorage-based persistence

const today = new Date()
const formatDate = (daysOffset = 0) => {
  const d = new Date(today)
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

// Domain / Program / Application / WR mappings
export const DOMAINS = [
  { id: 'dom-1', name: 'Digital Banking', code: 'DB' },
  { id: 'dom-2', name: 'Payments', code: 'PAY' },
  { id: 'dom-3', name: 'Lending', code: 'LND' },
  { id: 'dom-4', name: 'Cards', code: 'CRD' },
  { id: 'dom-5', name: 'Core Banking', code: 'CB' },
]

export const PROGRAMS = [
  { id: 'prg-1', name: 'Mobile App Revamp', domainId: 'dom-1', code: 'MAR' },
  { id: 'prg-2', name: 'Online Portal 2.0', domainId: 'dom-1', code: 'OP2' },
  { id: 'prg-3', name: 'Real-Time Payments', domainId: 'dom-2', code: 'RTP' },
  { id: 'prg-4', name: 'ISO 20022 Migration', domainId: 'dom-2', code: 'ISO' },
  { id: 'prg-5', name: 'Auto Loan Platform', domainId: 'dom-3', code: 'ALP' },
  { id: 'prg-6', name: 'Mortgage Origination', domainId: 'dom-3', code: 'MOR' },
  { id: 'prg-7', name: 'Credit Card Rewards', domainId: 'dom-4', code: 'CCR' },
  { id: 'prg-8', name: 'Debit Card Modernization', domainId: 'dom-4', code: 'DCM' },
  { id: 'prg-9', name: 'Ledger Upgrade', domainId: 'dom-5', code: 'LUP' },
  { id: 'prg-10', name: 'Account Opening', domainId: 'dom-5', code: 'AOP' },
]

export const APPLICATIONS = [
  { id: 'app-1', name: 'Mobile iOS', programId: 'prg-1', code: 'MIOS' },
  { id: 'app-2', name: 'Mobile Android', programId: 'prg-1', code: 'MAND' },
  { id: 'app-3', name: 'Web Portal', programId: 'prg-2', code: 'WPRT' },
  { id: 'app-4', name: 'API Gateway', programId: 'prg-2', code: 'APIG' },
  { id: 'app-5', name: 'Payment Engine', programId: 'prg-3', code: 'PENG' },
  { id: 'app-6', name: 'Settlement Service', programId: 'prg-3', code: 'SSET' },
  { id: 'app-7', name: 'Message Translator', programId: 'prg-4', code: 'MTRN' },
  { id: 'app-8', name: 'Loan Origination', programId: 'prg-5', code: 'LORG' },
  { id: 'app-9', name: 'Underwriting Engine', programId: 'prg-5', code: 'UENG' },
  { id: 'app-10', name: 'Mortgage Portal', programId: 'prg-6', code: 'MPRT' },
  { id: 'app-11', name: 'Rewards Engine', programId: 'prg-7', code: 'RENG' },
  { id: 'app-12', name: 'Card Management', programId: 'prg-8', code: 'CMGT' },
  { id: 'app-13', name: 'General Ledger', programId: 'prg-9', code: 'GLGR' },
  { id: 'app-14', name: 'Account Service', programId: 'prg-10', code: 'ASVC' },
]

export const WORK_REQUESTS = [
  { id: 'wr-1', name: 'WR-2024-001', applicationId: 'app-1', description: 'iOS biometric login' },
  { id: 'wr-2', name: 'WR-2024-002', applicationId: 'app-1', description: 'Push notification overhaul' },
  { id: 'wr-3', name: 'WR-2024-003', applicationId: 'app-2', description: 'Android widget support' },
  { id: 'wr-4', name: 'WR-2024-004', applicationId: 'app-3', description: 'Dashboard redesign' },
  { id: 'wr-5', name: 'WR-2024-005', applicationId: 'app-5', description: 'Instant payment routing' },
  { id: 'wr-6', name: 'WR-2024-006', applicationId: 'app-6', description: 'Batch settlement optimization' },
  { id: 'wr-7', name: 'WR-2024-007', applicationId: 'app-7', description: 'SWIFT to ISO translation' },
  { id: 'wr-8', name: 'WR-2024-008', applicationId: 'app-8', description: 'Auto-decision engine' },
  { id: 'wr-9', name: 'WR-2024-009', applicationId: 'app-10', description: 'E-signature integration' },
  { id: 'wr-10', name: 'WR-2024-010', applicationId: 'app-11', description: 'Points multiplier feature' },
  { id: 'wr-11', name: 'WR-2024-011', applicationId: 'app-13', description: 'Multi-currency ledger' },
  { id: 'wr-12', name: 'WR-2024-012', applicationId: 'app-14', description: 'KYC automation' },
]

// Release Readiness Records
export const RELEASE_READINESS_RECORDS = [
  {
    id: 'rr-1',
    releaseId: 'REL-2024-Q4-01',
    releaseName: 'Q4 2024 Release 1',
    domain: 'Digital Banking',
    program: 'Mobile App Revamp',
    application: 'Mobile iOS',
    releaseDate: formatDate(14),
    status: 'On Track',
    testCasesTotal: 1250,
    testCasesExecuted: 980,
    testCasesPassed: 920,
    testCasesFailed: 45,
    testCasesBlocked: 15,
    defectsOpen: 12,
    defectsCritical: 2,
    defectsHigh: 4,
    defectsMedium: 4,
    defectsLow: 2,
    automationCoverage: 72,
    regressionPassRate: 94.5,
    environmentReadiness: 'Green',
    signOffStatus: 'Pending',
    lastUpdated: formatDate(0),
  },
  {
    id: 'rr-2',
    releaseId: 'REL-2024-Q4-01',
    releaseName: 'Q4 2024 Release 1',
    domain: 'Digital Banking',
    program: 'Mobile App Revamp',
    application: 'Mobile Android',
    releaseDate: formatDate(14),
    status: 'At Risk',
    testCasesTotal: 1180,
    testCasesExecuted: 750,
    testCasesPassed: 680,
    testCasesFailed: 55,
    testCasesBlocked: 15,
    defectsOpen: 18,
    defectsCritical: 3,
    defectsHigh: 7,
    defectsMedium: 5,
    defectsLow: 3,
    automationCoverage: 65,
    regressionPassRate: 88.2,
    environmentReadiness: 'Amber',
    signOffStatus: 'Pending',
    lastUpdated: formatDate(0),
  },
  {
    id: 'rr-3',
    releaseId: 'REL-2024-Q4-02',
    releaseName: 'Q4 2024 Release 2',
    domain: 'Payments',
    program: 'Real-Time Payments',
    application: 'Payment Engine',
    releaseDate: formatDate(28),
    status: 'On Track',
    testCasesTotal: 890,
    testCasesExecuted: 620,
    testCasesPassed: 590,
    testCasesFailed: 22,
    testCasesBlocked: 8,
    defectsOpen: 8,
    defectsCritical: 1,
    defectsHigh: 2,
    defectsMedium: 3,
    defectsLow: 2,
    automationCoverage: 80,
    regressionPassRate: 96.1,
    environmentReadiness: 'Green',
    signOffStatus: 'Not Started',
    lastUpdated: formatDate(-1),
  },
  {
    id: 'rr-4',
    releaseId: 'REL-2024-Q4-02',
    releaseName: 'Q4 2024 Release 2',
    domain: 'Payments',
    program: 'ISO 20022 Migration',
    application: 'Message Translator',
    releaseDate: formatDate(28),
    status: 'Critical',
    testCasesTotal: 560,
    testCasesExecuted: 280,
    testCasesPassed: 230,
    testCasesFailed: 38,
    testCasesBlocked: 12,
    defectsOpen: 25,
    defectsCritical: 5,
    defectsHigh: 9,
    defectsMedium: 7,
    defectsLow: 4,
    automationCoverage: 45,
    regressionPassRate: 78.3,
    environmentReadiness: 'Red',
    signOffStatus: 'Not Started',
    lastUpdated: formatDate(0),
  },
  {
    id: 'rr-5',
    releaseId: 'REL-2024-Q4-03',
    releaseName: 'Q4 2024 Release 3',
    domain: 'Lending',
    program: 'Auto Loan Platform',
    application: 'Loan Origination',
    releaseDate: formatDate(42),
    status: 'On Track',
    testCasesTotal: 720,
    testCasesExecuted: 350,
    testCasesPassed: 330,
    testCasesFailed: 14,
    testCasesBlocked: 6,
    defectsOpen: 6,
    defectsCritical: 0,
    defectsHigh: 2,
    defectsMedium: 3,
    defectsLow: 1,
    automationCoverage: 68,
    regressionPassRate: 95.8,
    environmentReadiness: 'Green',
    signOffStatus: 'Not Started',
    lastUpdated: formatDate(-2),
  },
  {
    id: 'rr-6',
    releaseId: 'REL-2024-Q4-03',
    releaseName: 'Q4 2024 Release 3',
    domain: 'Cards',
    program: 'Credit Card Rewards',
    application: 'Rewards Engine',
    releaseDate: formatDate(42),
    status: 'On Track',
    testCasesTotal: 480,
    testCasesExecuted: 200,
    testCasesPassed: 190,
    testCasesFailed: 8,
    testCasesBlocked: 2,
    defectsOpen: 4,
    defectsCritical: 0,
    defectsHigh: 1,
    defectsMedium: 2,
    defectsLow: 1,
    automationCoverage: 75,
    regressionPassRate: 97.2,
    environmentReadiness: 'Green',
    signOffStatus: 'Not Started',
    lastUpdated: formatDate(-1),
  },
]

// Showstopper Defects
export const SHOWSTOPPER_DEFECTS = [
  {
    id: 'ss-1',
    defectId: 'DEF-4521',
    title: 'Payment transaction fails silently on timeout',
    severity: 'Critical',
    priority: 'P1',
    status: 'Open',
    domain: 'Payments',
    program: 'Real-Time Payments',
    application: 'Payment Engine',
    assignee: 'John Smith',
    reportedDate: formatDate(-5),
    targetDate: formatDate(2),
    environment: 'SIT',
    description: 'When payment gateway times out after 30s, transaction status remains pending with no retry or error notification to user.',
    impact: 'Customers see pending transactions indefinitely, leading to duplicate payment attempts.',
    rootCause: 'Missing timeout handler in async payment flow',
    workaround: 'Manual reconciliation by ops team',
  },
  {
    id: 'ss-2',
    defectId: 'DEF-4533',
    title: 'iOS app crashes on biometric authentication',
    severity: 'Critical',
    priority: 'P1',
    status: 'In Progress',
    domain: 'Digital Banking',
    program: 'Mobile App Revamp',
    application: 'Mobile iOS',
    assignee: 'Sarah Chen',
    reportedDate: formatDate(-3),
    targetDate: formatDate(1),
    environment: 'UAT',
    description: 'App crashes when Face ID fails and falls back to passcode entry on iOS 17.x devices.',
    impact: 'Users on iOS 17+ cannot log in if Face ID fails on first attempt.',
    rootCause: 'Race condition in biometric callback handler',
    workaround: 'Force close and reopen app',
  },
  {
    id: 'ss-3',
    defectId: 'DEF-4540',
    title: 'ISO message translation drops mandatory fields',
    severity: 'Critical',
    priority: 'P1',
    status: 'Open',
    domain: 'Payments',
    program: 'ISO 20022 Migration',
    application: 'Message Translator',
    assignee: 'Mike Johnson',
    reportedDate: formatDate(-2),
    targetDate: formatDate(3),
    environment: 'SIT',
    description: 'SWIFT MT103 to pacs.008 translation drops debtor agent BIC when intermediary bank is present.',
    impact: 'Translated messages rejected by receiving banks, blocking cross-border payments.',
    rootCause: 'Mapping rule does not account for multi-hop routing',
    workaround: 'Manual message correction before sending',
  },
  {
    id: 'ss-4',
    defectId: 'DEF-4548',
    title: 'Data corruption in batch settlement processing',
    severity: 'Critical',
    priority: 'P1',
    status: 'Open',
    domain: 'Payments',
    program: 'Real-Time Payments',
    application: 'Settlement Service',
    assignee: 'Lisa Wang',
    reportedDate: formatDate(-1),
    targetDate: formatDate(4),
    environment: 'SIT',
    description: 'Settlement batch with >10,000 records causes decimal precision loss in amount fields.',
    impact: 'Financial discrepancies in end-of-day settlement totals.',
    rootCause: 'Float arithmetic used instead of BigDecimal for aggregation',
    workaround: 'Process batches in chunks of 5,000',
  },
  {
    id: 'ss-5',
    defectId: 'DEF-4555',
    title: 'Android app memory leak on dashboard refresh',
    severity: 'Critical',
    priority: 'P1',
    status: 'In Progress',
    domain: 'Digital Banking',
    program: 'Mobile App Revamp',
    application: 'Mobile Android',
    assignee: 'David Park',
    reportedDate: formatDate(-4),
    targetDate: formatDate(1),
    environment: 'UAT',
    description: 'Repeated pull-to-refresh on account dashboard causes OOM crash after ~15 refreshes.',
    impact: 'App becomes unusable for active users checking balances frequently.',
    rootCause: 'RecyclerView adapter not releasing bitmap references',
    workaround: 'Restart app periodically',
  },
]

// Deferred Defects
export const DEFERRED_DEFECTS = [
  {
    id: 'dd-1',
    defectId: 'DEF-3890',
    title: 'Minor UI alignment issue on tablet landscape mode',
    severity: 'Low',
    priority: 'P4',
    status: 'Deferred',
    domain: 'Digital Banking',
    program: 'Online Portal 2.0',
    application: 'Web Portal',
    deferredTo: 'Q1 2025 Release 1',
    reason: 'Low impact, tablet usage <5% of traffic',
    originalRelease: 'Q4 2024 Release 1',
    reportedDate: formatDate(-30),
    deferredDate: formatDate(-10),
  },
  {
    id: 'dd-2',
    defectId: 'DEF-3920',
    title: 'Tooltip text truncated on small screen resolutions',
    severity: 'Low',
    priority: 'P4',
    status: 'Deferred',
    domain: 'Digital Banking',
    program: 'Mobile App Revamp',
    application: 'Mobile iOS',
    deferredTo: 'Q1 2025 Release 1',
    reason: 'Cosmetic issue, does not affect functionality',
    originalRelease: 'Q4 2024 Release 1',
    reportedDate: formatDate(-25),
    deferredDate: formatDate(-8),
  },
  {
    id: 'dd-3',
    defectId: 'DEF-4010',
    title: 'Sorting by date column uses string comparison',
    severity: 'Medium',
    priority: 'P3',
    status: 'Deferred',
    domain: 'Lending',
    program: 'Auto Loan Platform',
    application: 'Loan Origination',
    deferredTo: 'Q1 2025 Release 2',
    reason: 'Workaround available, not blocking release',
    originalRelease: 'Q4 2024 Release 3',
    reportedDate: formatDate(-20),
    deferredDate: formatDate(-5),
  },
  {
    id: 'dd-4',
    defectId: 'DEF-4055',
    title: 'Export to PDF missing header logo',
    severity: 'Low',
    priority: 'P4',
    status: 'Deferred',
    domain: 'Payments',
    program: 'Real-Time Payments',
    application: 'Payment Engine',
    deferredTo: 'Q1 2025 Release 1',
    reason: 'PDF export is secondary feature, CSV export works correctly',
    originalRelease: 'Q4 2024 Release 2',
    reportedDate: formatDate(-18),
    deferredDate: formatDate(-7),
  },
  {
    id: 'dd-5',
    defectId: 'DEF-4102',
    title: 'Accessibility: missing aria-labels on icon buttons',
    severity: 'Medium',
    priority: 'P3',
    status: 'Deferred',
    domain: 'Cards',
    program: 'Credit Card Rewards',
    application: 'Rewards Engine',
    deferredTo: 'Q1 2025 Release 1',
    reason: 'Accessibility audit scheduled for Q1, will address holistically',
    originalRelease: 'Q4 2024 Release 3',
    reportedDate: formatDate(-15),
    deferredDate: formatDate(-3),
  },
  {
    id: 'dd-6',
    defectId: 'DEF-4130',
    title: 'Slow query on transaction history for accounts with >50k records',
    severity: 'Medium',
    priority: 'P3',
    status: 'Deferred',
    domain: 'Core Banking',
    program: 'Ledger Upgrade',
    application: 'General Ledger',
    deferredTo: 'Q1 2025 Release 2',
    reason: 'Requires database index optimization, scheduled with DBA team',
    originalRelease: 'Q4 2024 Release 2',
    reportedDate: formatDate(-22),
    deferredDate: formatDate(-6),
  },
]

// SIT Defect Summary
export const SIT_DEFECT_SUMMARY = [
  { id: 'sit-1', domain: 'Digital Banking', totalDefects: 45, critical: 3, high: 12, medium: 18, low: 12, open: 18, inProgress: 12, resolved: 10, closed: 5, reopened: 2 },
  { id: 'sit-2', domain: 'Payments', totalDefects: 62, critical: 6, high: 18, medium: 24, low: 14, open: 28, inProgress: 15, resolved: 12, closed: 7, reopened: 4 },
  { id: 'sit-3', domain: 'Lending', totalDefects: 28, critical: 1, high: 6, medium: 12, low: 9, open: 10, inProgress: 8, resolved: 6, closed: 4, reopened: 1 },
  { id: 'sit-4', domain: 'Cards', totalDefects: 22, critical: 1, high: 5, medium: 10, low: 6, open: 8, inProgress: 6, resolved: 5, closed: 3, reopened: 1 },
  { id: 'sit-5', domain: 'Core Banking', totalDefects: 35, critical: 2, high: 9, medium: 15, low: 9, open: 14, inProgress: 10, resolved: 7, closed: 4, reopened: 2 },
]

// Domain DSR (Daily Status Report) Data
export const DOMAIN_DSR_DATA = [
  {
    id: 'dsr-dom-1',
    date: formatDate(0),
    domain: 'Digital Banking',
    totalTestCases: 2430,
    executed: 1730,
    passed: 1600,
    failed: 100,
    blocked: 30,
    executionRate: 71.2,
    passRate: 92.5,
    defectsRaised: 8,
    defectsResolved: 5,
    blockers: 'Environment downtime for 2 hours in morning',
    highlights: 'Completed regression cycle for iOS biometric module',
    risks: 'Android build stability issues may delay execution',
  },
  {
    id: 'dsr-dom-2',
    date: formatDate(0),
    domain: 'Payments',
    totalTestCases: 1450,
    executed: 900,
    passed: 820,
    failed: 60,
    blocked: 20,
    executionRate: 62.1,
    passRate: 91.1,
    defectsRaised: 12,
    defectsResolved: 7,
    blockers: 'Payment gateway sandbox intermittent failures',
    highlights: 'ISO translation test suite 60% complete',
    risks: 'Critical defect DEF-4540 blocking 15 test cases',
  },
  {
    id: 'dsr-dom-3',
    date: formatDate(0),
    domain: 'Lending',
    totalTestCases: 720,
    executed: 350,
    passed: 330,
    failed: 14,
    blocked: 6,
    executionRate: 48.6,
    passRate: 94.3,
    defectsRaised: 3,
    defectsResolved: 4,
    blockers: 'None',
    highlights: 'Auto-decision engine test cases ahead of schedule',
    risks: 'Underwriting rules update pending from business',
  },
  {
    id: 'dsr-dom-4',
    date: formatDate(0),
    domain: 'Cards',
    totalTestCases: 480,
    executed: 200,
    passed: 190,
    failed: 8,
    blocked: 2,
    executionRate: 41.7,
    passRate: 95.0,
    defectsRaised: 2,
    defectsResolved: 3,
    blockers: 'None',
    highlights: 'Rewards calculation engine validated for all tiers',
    risks: 'Third-party loyalty API integration testing not started',
  },
  {
    id: 'dsr-dom-5',
    date: formatDate(0),
    domain: 'Core Banking',
    totalTestCases: 950,
    executed: 520,
    passed: 480,
    failed: 28,
    blocked: 12,
    executionRate: 54.7,
    passRate: 92.3,
    defectsRaised: 6,
    defectsResolved: 4,
    blockers: 'Database migration script failed in SIT environment',
    highlights: 'Multi-currency ledger posting validated',
    risks: 'Performance testing delayed due to environment constraints',
  },
  {
    id: 'dsr-dom-6',
    date: formatDate(-1),
    domain: 'Digital Banking',
    totalTestCases: 2430,
    executed: 1650,
    passed: 1530,
    failed: 92,
    blocked: 28,
    executionRate: 67.9,
    passRate: 92.7,
    defectsRaised: 6,
    defectsResolved: 8,
    blockers: 'None',
    highlights: 'Push notification test suite completed',
    risks: 'iOS 17 compatibility issues under investigation',
  },
  {
    id: 'dsr-dom-7',
    date: formatDate(-1),
    domain: 'Payments',
    totalTestCases: 1450,
    executed: 830,
    passed: 760,
    failed: 52,
    blocked: 18,
    executionRate: 57.2,
    passRate: 91.6,
    defectsRaised: 10,
    defectsResolved: 6,
    blockers: 'Settlement service deployment delayed',
    highlights: 'Real-time payment happy path validated end-to-end',
    risks: 'Batch settlement defect may impact release timeline',
  },
]

// Program DSR Data
export const PROGRAM_DSR_DATA = [
  {
    id: 'dsr-prg-1',
    date: formatDate(0),
    program: 'Mobile App Revamp',
    domain: 'Digital Banking',
    totalTestCases: 2430,
    executed: 1730,
    passed: 1600,
    failed: 100,
    blocked: 30,
    defectsOpen: 30,
    defectsInProgress: 12,
    defectsResolved: 15,
    blockerCount: 2,
    criticalCount: 5,
    testingPhase: 'SIT Cycle 2',
    completionPercentage: 71.2,
  },
  {
    id: 'dsr-prg-2',
    date: formatDate(0),
    program: 'Online Portal 2.0',
    domain: 'Digital Banking',
    totalTestCases: 680,
    executed: 520,
    passed: 490,
    failed: 22,
    blocked: 8,
    defectsOpen: 8,
    defectsInProgress: 5,
    defectsResolved: 12,
    blockerCount: 0,
    criticalCount: 1,
    testingPhase: 'UAT',
    completionPercentage: 76.5,
  },
  {
    id: 'dsr-prg-3',
    date: formatDate(0),
    program: 'Real-Time Payments',
    domain: 'Payments',
    totalTestCases: 890,
    executed: 620,
    passed: 590,
    failed: 22,
    blocked: 8,
    defectsOpen: 15,
    defectsInProgress: 8,
    defectsResolved: 10,
    blockerCount: 1,
    criticalCount: 2,
    testingPhase: 'SIT Cycle 2',
    completionPercentage: 69.7,
  },
  {
    id: 'dsr-prg-4',
    date: formatDate(0),
    program: 'ISO 20022 Migration',
    domain: 'Payments',
    totalTestCases: 560,
    executed: 280,
    passed: 230,
    failed: 38,
    blocked: 12,
    defectsOpen: 25,
    defectsInProgress: 10,
    defectsResolved: 5,
    blockerCount: 2,
    criticalCount: 5,
    testingPhase: 'SIT Cycle 1',
    completionPercentage: 50.0,
  },
  {
    id: 'dsr-prg-5',
    date: formatDate(0),
    program: 'Auto Loan Platform',
    domain: 'Lending',
    totalTestCases: 720,
    executed: 350,
    passed: 330,
    failed: 14,
    blocked: 6,
    defectsOpen: 6,
    defectsInProgress: 4,
    defectsResolved: 8,
    blockerCount: 0,
    criticalCount: 0,
    testingPhase: 'SIT Cycle 1',
    completionPercentage: 48.6,
  },
  {
    id: 'dsr-prg-6',
    date: formatDate(0),
    program: 'Credit Card Rewards',
    domain: 'Cards',
    totalTestCases: 480,
    executed: 200,
    passed: 190,
    failed: 8,
    blocked: 2,
    defectsOpen: 4,
    defectsInProgress: 3,
    defectsResolved: 6,
    blockerCount: 0,
    criticalCount: 0,
    testingPhase: 'SIT Cycle 1',
    completionPercentage: 41.7,
  },
]

// Program Status Data
export const PROGRAM_STATUS_DATA = [
  {
    id: 'ps-1',
    program: 'Mobile App Revamp',
    domain: 'Digital Banking',
    overallStatus: 'Amber',
    scheduleStatus: 'Amber',
    qualityStatus: 'Amber',
    scopeStatus: 'Green',
    resourceStatus: 'Green',
    releaseDate: formatDate(14),
    testProgress: 71.2,
    defectTrend: 'Increasing',
    keyRisks: ['Critical defect on iOS biometric', 'Android memory leak under investigation'],
    mitigations: ['Hotfix branch created for iOS', 'Memory profiling session scheduled'],
    nextMilestone: 'SIT Cycle 2 completion',
    nextMilestoneDate: formatDate(7),
  },
  {
    id: 'ps-2',
    program: 'Online Portal 2.0',
    domain: 'Digital Banking',
    overallStatus: 'Green',
    scheduleStatus: 'Green',
    qualityStatus: 'Green',
    scopeStatus: 'Green',
    resourceStatus: 'Green',
    releaseDate: formatDate(14),
    testProgress: 76.5,
    defectTrend: 'Decreasing',
    keyRisks: [],
    mitigations: [],
    nextMilestone: 'UAT sign-off',
    nextMilestoneDate: formatDate(10),
  },
  {
    id: 'ps-3',
    program: 'Real-Time Payments',
    domain: 'Payments',
    overallStatus: 'Amber',
    scheduleStatus: 'Green',
    qualityStatus: 'Amber',
    scopeStatus: 'Green',
    resourceStatus: 'Amber',
    releaseDate: formatDate(28),
    testProgress: 69.7,
    defectTrend: 'Stable',
    keyRisks: ['Settlement batch processing defect', 'Payment gateway sandbox instability'],
    mitigations: ['BigDecimal fix in development', 'Sandbox team engaged for stability'],
    nextMilestone: 'SIT Cycle 2 completion',
    nextMilestoneDate: formatDate(14),
  },
  {
    id: 'ps-4',
    program: 'ISO 20022 Migration',
    domain: 'Payments',
    overallStatus: 'Red',
    scheduleStatus: 'Red',
    qualityStatus: 'Red',
    scopeStatus: 'Amber',
    resourceStatus: 'Red',
    releaseDate: formatDate(28),
    testProgress: 50.0,
    defectTrend: 'Increasing',
    keyRisks: ['5 critical defects open', 'Only 50% test execution', 'Environment instability'],
    mitigations: ['War room established', 'Additional resources onboarded', 'Environment rebuild scheduled'],
    nextMilestone: 'SIT Cycle 1 completion',
    nextMilestoneDate: formatDate(7),
  },
  {
    id: 'ps-5',
    program: 'Auto Loan Platform',
    domain: 'Lending',
    overallStatus: 'Green',
    scheduleStatus: 'Green',
    qualityStatus: 'Green',
    scopeStatus: 'Green',
    resourceStatus: 'Green',
    releaseDate: formatDate(42),
    testProgress: 48.6,
    defectTrend: 'Stable',
    keyRisks: [],
    mitigations: [],
    nextMilestone: 'SIT Cycle 1 completion',
    nextMilestoneDate: formatDate(14),
  },
  {
    id: 'ps-6',
    program: 'Credit Card Rewards',
    domain: 'Cards',
    overallStatus: 'Green',
    scheduleStatus: 'Green',
    qualityStatus: 'Green',
    scopeStatus: 'Green',
    resourceStatus: 'Green',
    releaseDate: formatDate(42),
    testProgress: 41.7,
    defectTrend: 'Stable',
    keyRisks: ['Third-party loyalty API integration not started'],
    mitigations: ['API documentation review in progress, integration sprint planned'],
    nextMilestone: 'SIT Cycle 1 completion',
    nextMilestoneDate: formatDate(14),
  },
]

// Monthly QE Trends (last 6 months)
export const MONTHLY_QE_TRENDS = [
  { month: 'May 2024', testCasesExecuted: 4200, defectsFound: 145, defectsFixed: 130, automationRate: 58, passRate: 89.2 },
  { month: 'Jun 2024', testCasesExecuted: 4800, defectsFound: 162, defectsFixed: 148, automationRate: 61, passRate: 90.1 },
  { month: 'Jul 2024', testCasesExecuted: 5100, defectsFound: 138, defectsFixed: 155, automationRate: 63, passRate: 91.5 },
  { month: 'Aug 2024', testCasesExecuted: 5500, defectsFound: 120, defectsFixed: 135, automationRate: 66, passRate: 92.8 },
  { month: 'Sep 2024', testCasesExecuted: 5900, defectsFound: 155, defectsFixed: 140, automationRate: 69, passRate: 91.2 },
  { month: 'Oct 2024', testCasesExecuted: 6200, defectsFound: 172, defectsFixed: 150, automationRate: 71, passRate: 90.5 },
]

// Defect Trend Data (last 14 days)
export const DEFECT_TREND_DATA = Array.from({ length: 14 }, (_, i) => {
  const dayOffset = -(13 - i)
  const baseOpen = 85 + Math.floor(Math.random() * 20)
  const baseClosed = 70 + Math.floor(Math.random() * 15)
  const baseNew = 8 + Math.floor(Math.random() * 8)
  return {
    date: formatDate(dayOffset),
    openDefects: baseOpen + i * 2,
    closedDefects: baseClosed + i * 3,
    newDefects: baseNew,
    reopened: Math.floor(Math.random() * 3),
  }
})

// Severity Distribution
export const SEVERITY_DISTRIBUTION = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 38, color: '#f97316' },
  { name: 'Medium', value: 65, color: '#eab308' },
  { name: 'Low', value: 42, color: '#22c55e' },
]

// Environment Distribution
export const ENVIRONMENT_DISTRIBUTION = [
  { name: 'SIT', defects: 78, percentage: 49.7 },
  { name: 'UAT', defects: 42, percentage: 26.8 },
  { name: 'Performance', defects: 18, percentage: 11.5 },
  { name: 'Pre-Prod', defects: 12, percentage: 7.6 },
  { name: 'Production', defects: 7, percentage: 4.5 },
]

// RCA (Root Cause Analysis) Data
export const RCA_DATA = [
  { category: 'Code Defect', count: 52, percentage: 33.1 },
  { category: 'Requirements Gap', count: 28, percentage: 17.8 },
  { category: 'Environment Issue', count: 22, percentage: 14.0 },
  { category: 'Data Issue', count: 18, percentage: 11.5 },
  { category: 'Integration Mismatch', count: 15, percentage: 9.6 },
  { category: 'Configuration Error', count: 12, percentage: 7.6 },
  { category: 'Design Flaw', count: 6, percentage: 3.8 },
  { category: 'Other', count: 4, percentage: 2.5 },
]

// Quality Metrics
export const QUALITY_METRICS = {
  overallPassRate: 92.1,
  overallAutomationCoverage: 68.5,
  defectLeakageRate: 2.3,
  defectRejectionRate: 4.8,
  averageDefectAge: 5.2,
  defectRemovalEfficiency: 94.5,
  testEfficiency: 88.7,
  requirementsCoverage: 96.2,
  defectDensity: 1.8,
  meanTimeToResolve: 3.4,
  byDomain: [
    { domain: 'Digital Banking', passRate: 92.5, automationCoverage: 68, defectDensity: 1.9, avgResolutionDays: 3.2 },
    { domain: 'Payments', passRate: 91.1, automationCoverage: 62, defectDensity: 2.4, avgResolutionDays: 4.1 },
    { domain: 'Lending', passRate: 94.3, automationCoverage: 68, defectDensity: 1.4, avgResolutionDays: 2.8 },
    { domain: 'Cards', passRate: 95.0, automationCoverage: 75, defectDensity: 1.2, avgResolutionDays: 2.5 },
    { domain: 'Core Banking', passRate: 92.3, automationCoverage: 60, defectDensity: 2.0, avgResolutionDays: 3.8 },
  ],
}

// Quick Links
export const QUICK_LINKS = [
  { id: 'ql-1', title: 'Jira Dashboard', url: 'https://jira.example.com/dashboard', category: 'Tools', icon: 'ExternalLink', description: 'Project tracking and defect management' },
  { id: 'ql-2', title: 'Confluence Wiki', url: 'https://confluence.example.com/qe-hub', category: 'Documentation', icon: 'BookOpen', description: 'QE processes and documentation' },
  { id: 'ql-3', title: 'Elastic APM', url: 'https://elastic.example.com/apm', category: 'Monitoring', icon: 'Activity', description: 'Application performance monitoring' },
  { id: 'ql-4', title: 'Jenkins CI/CD', url: 'https://jenkins.example.com', category: 'Tools', icon: 'Settings', description: 'Build and deployment pipelines' },
  { id: 'ql-5', title: 'Test Rail', url: 'https://testrail.example.com', category: 'Tools', icon: 'ClipboardCheck', description: 'Test case management' },
  { id: 'ql-6', title: 'Grafana Dashboards', url: 'https://grafana.example.com', category: 'Monitoring', icon: 'BarChart3', description: 'Infrastructure and application metrics' },
  { id: 'ql-7', title: 'QE Runbook', url: 'https://confluence.example.com/qe-runbook', category: 'Documentation', icon: 'FileText', description: 'Standard operating procedures' },
  { id: 'ql-8', title: 'Automation Framework', url: 'https://github.example.com/qe-automation', category: 'Tools', icon: 'Code', description: 'Test automation repository' },
  { id: 'ql-9', title: 'Release Calendar', url: 'https://confluence.example.com/release-calendar', category: 'Planning', icon: 'Calendar', description: 'Upcoming release schedule' },
  { id: 'ql-10', title: 'Defect Triage Guide', url: 'https://confluence.example.com/defect-triage', category: 'Documentation', icon: 'AlertTriangle', description: 'Defect severity and priority guidelines' },
]

// All mock data bundled for easy localStorage seeding
export const ALL_MOCK_DATA = {
  domains: DOMAINS,
  programs: PROGRAMS,
  applications: APPLICATIONS,
  workRequests: WORK_REQUESTS,
  releaseReadinessRecords: RELEASE_READINESS_RECORDS,
  showstopperDefects: SHOWSTOPPER_DEFECTS,
  deferredDefects: DEFERRED_DEFECTS,
  sitDefectSummary: SIT_DEFECT_SUMMARY,
  domainDsrData: DOMAIN_DSR_DATA,
  programDsrData: PROGRAM_DSR_DATA,
  programStatusData: PROGRAM_STATUS_DATA,
  monthlyQeTrends: MONTHLY_QE_TRENDS,
  defectTrendData: DEFECT_TREND_DATA,
  severityDistribution: SEVERITY_DISTRIBUTION,
  environmentDistribution: ENVIRONMENT_DISTRIBUTION,
  rcaData: RCA_DATA,
  qualityMetrics: QUALITY_METRICS,
  quickLinks: QUICK_LINKS,
}

/**
 * Seeds localStorage with mock data if not already present.
 * Call this once at app initialization.
 */
export function seedMockData() {
  const STORAGE_KEY = 'qe-hub-data'
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_MOCK_DATA))
    }
  } catch (error) {
    console.error('Failed to seed mock data to localStorage:', error)
  }
}

/**
 * Retrieves a specific data set from localStorage.
 * Falls back to mock data if localStorage is empty.
 * @param {string} key - The key within ALL_MOCK_DATA to retrieve
 * @returns {*} The data for the given key
 */
export function getMockData(key) {
  const STORAGE_KEY = 'qe-hub-data'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (key in parsed) {
        return parsed[key]
      }
    }
  } catch (error) {
    console.error('Failed to read mock data from localStorage:', error)
  }
  return ALL_MOCK_DATA[key] || null
}

/**
 * Updates a specific data set in localStorage.
 * @param {string} key - The key within ALL_MOCK_DATA to update
 * @param {*} data - The new data to store
 */
export function setMockData(key, data) {
  const STORAGE_KEY = 'qe-hub-data'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : { ...ALL_MOCK_DATA }
    parsed[key] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch (error) {
    console.error('Failed to write mock data to localStorage:', error)
  }
}

/**
 * Resets all localStorage data back to initial mock data.
 */
export function resetMockData() {
  const STORAGE_KEY = 'qe-hub-data'
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_MOCK_DATA))
  } catch (error) {
    console.error('Failed to reset mock data in localStorage:', error)
  }
}

export default ALL_MOCK_DATA