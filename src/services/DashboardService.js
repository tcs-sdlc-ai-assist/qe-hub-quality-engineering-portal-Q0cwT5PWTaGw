// src/services/DashboardService.js
// Central data access service for all dashboard views.
// Reads from localStorage (uploaded or mock data), applies filters, returns formatted data.
// Pure JS — no JSX.

const STORAGE_KEYS = {
  readiness: 'dashboard_readiness',
  showstopperDefects: 'defects_showstopper',
  deferredDefects: 'defects_deferred',
  sitDefectSummary: 'sit_defect_summary',
  dsrDomain: 'dsr_domain',
  dsrProgram: 'dsr_program',
  programStatus: 'program_status',
  qualityMetrics: 'quality_metrics',
  monthlyTrends: 'monthly_trends',
  defectTrends: 'defect_trends',
  severityDistribution: 'defect_severity_distribution',
  environmentDistribution: 'defect_environment_distribution',
  rcaCharts: 'rca_charts',
};

// ── Mock Data Generators ──────────────────────────────────────────────

function generateMockReadiness() {
  return [
    {
      release: 'Release 2024.2',
      program: 'QE Automation',
      domain: 'Payments',
      wr_number: 'WR-12345',
      application: 'PayGateway',
      rag_status: 'Green',
      test_execution_pass_pct: 92.5,
      total_defects: 15,
      open_defects: 3,
      confidence_index: 8.7,
      comments: 'Ready for SIT sign-off',
    },
    {
      release: 'Release 2024.2',
      program: 'QE Automation',
      domain: 'Lending',
      wr_number: 'WR-12346',
      application: 'LoanEngine',
      rag_status: 'Amber',
      test_execution_pass_pct: 78.3,
      total_defects: 22,
      open_defects: 8,
      confidence_index: 6.2,
      comments: 'Pending defect fixes',
    },
    {
      release: 'Release 2024.2',
      program: 'Platform Modernization',
      domain: 'Core Banking',
      wr_number: 'WR-12347',
      application: 'CoreLedger',
      rag_status: 'Red',
      test_execution_pass_pct: 55.0,
      total_defects: 40,
      open_defects: 18,
      confidence_index: 3.5,
      comments: 'Critical blockers open',
    },
    {
      release: 'Release 2024.1',
      program: 'QE Automation',
      domain: 'Payments',
      wr_number: 'WR-12340',
      application: 'PayGateway',
      rag_status: 'Green',
      test_execution_pass_pct: 98.0,
      total_defects: 5,
      open_defects: 0,
      confidence_index: 9.5,
      comments: 'Completed',
    },
  ];
}

function generateMockShowstopperDefects() {
  return [
    {
      defect_id: 'DEF-5001',
      release: 'Release 2024.2',
      program: 'QE Automation',
      domain: 'Payments',
      application: 'PayGateway',
      severity: 'Critical',
      status: 'Open',
      summary: 'Payment timeout on high load',
      assigned_to: 'John Doe',
      age_days: 5,
      wr_number: 'WR-12345',
    },
    {
      defect_id: 'DEF-5002',
      release: 'Release 2024.2',
      program: 'Platform Modernization',
      domain: 'Core Banking',
      application: 'CoreLedger',
      severity: 'Critical',
      status: 'In Progress',
      summary: 'Ledger balance mismatch after batch',
      assigned_to: 'Jane Smith',
      age_days: 3,
      wr_number: 'WR-12347',
    },
    {
      defect_id: 'DEF-5003',
      release: 'Release 2024.2',
      program: 'QE Automation',
      domain: 'Lending',
      application: 'LoanEngine',
      severity: 'Blocker',
      status: 'Open',
      summary: 'Loan approval workflow stuck',
      assigned_to: 'Bob Lee',
      age_days: 7,
      wr_number: 'WR-12346',
    },
  ];
}

function generateMockDeferredDefects() {
  return [
    {
      defect_id: 'DEF-4001',
      release: 'Release 2024.2',
      program: 'QE Automation',
      domain: 'Payments',
      application: 'PayGateway',
      severity: 'Major',
      status: 'Deferred',
      summary: 'Minor UI alignment issue on receipt page',
      deferred_to: 'Release 2024.3',
      wr_number: 'WR-12345',
    },
    {
      defect_id: 'DEF-4002',
      release: 'Release 2024.2',
      program: 'Platform Modernization',
      domain: 'Core Banking',
      application: 'CoreLedger',
      severity: 'Minor',
      status: 'Deferred',
      summary: 'Report export formatting inconsistency',
      deferred_to: 'Release 2024.3',
      wr_number: 'WR-12347',
    },
  ];
}

function generateMockSITDefectSummary() {
  return [
    {
      release: 'Release 2024.2',
      domain: 'Payments',
      program: 'QE Automation',
      total_defects: 30,
      open: 5,
      closed: 20,
      deferred: 3,
      in_progress: 2,
      critical: 2,
      major: 8,
      minor: 15,
      blocker: 5,
    },
    {
      release: 'Release 2024.2',
      domain: 'Lending',
      program: 'QE Automation',
      total_defects: 22,
      open: 8,
      closed: 10,
      deferred: 2,
      in_progress: 2,
      critical: 1,
      major: 6,
      minor: 10,
      blocker: 5,
    },
    {
      release: 'Release 2024.2',
      domain: 'Core Banking',
      program: 'Platform Modernization',
      total_defects: 40,
      open: 18,
      closed: 12,
      deferred: 5,
      in_progress: 5,
      critical: 5,
      major: 15,
      minor: 12,
      blocker: 8,
    },
  ];
}

function generateMockDSRDomain() {
  return [
    {
      domain: 'Payments',
      release: 'Release 2024.2',
      total_test_cases: 500,
      executed: 460,
      passed: 425,
      failed: 35,
      blocked: 10,
      not_run: 30,
      pass_pct: 92.4,
      defects_open: 5,
      defects_closed: 20,
      rag_status: 'Green',
      comments: 'On track',
    },
    {
      domain: 'Lending',
      release: 'Release 2024.2',
      total_test_cases: 350,
      executed: 280,
      passed: 220,
      failed: 60,
      blocked: 20,
      not_run: 50,
      pass_pct: 78.6,
      defects_open: 8,
      defects_closed: 10,
      rag_status: 'Amber',
      comments: 'Defect backlog growing',
    },
    {
      domain: 'Core Banking',
      release: 'Release 2024.2',
      total_test_cases: 600,
      executed: 330,
      passed: 180,
      failed: 150,
      blocked: 50,
      not_run: 220,
      pass_pct: 54.5,
      defects_open: 18,
      defects_closed: 12,
      rag_status: 'Red',
      comments: 'Critical blockers impacting execution',
    },
  ];
}

function generateMockDSRProgram() {
  return [
    {
      program: 'QE Automation',
      release: 'Release 2024.2',
      domain: 'Payments',
      total_test_cases: 500,
      executed: 460,
      passed: 425,
      failed: 35,
      pass_pct: 92.4,
      defects_open: 5,
      rag_status: 'Green',
      comments: 'On track',
    },
    {
      program: 'QE Automation',
      release: 'Release 2024.2',
      domain: 'Lending',
      total_test_cases: 350,
      executed: 280,
      passed: 220,
      failed: 60,
      pass_pct: 78.6,
      defects_open: 8,
      rag_status: 'Amber',
      comments: 'Defect backlog growing',
    },
    {
      program: 'Platform Modernization',
      release: 'Release 2024.2',
      domain: 'Core Banking',
      total_test_cases: 600,
      executed: 330,
      passed: 180,
      failed: 150,
      pass_pct: 54.5,
      defects_open: 18,
      rag_status: 'Red',
      comments: 'Critical blockers',
    },
  ];
}

function generateMockProgramStatus() {
  return [
    {
      program: 'QE Automation',
      release: 'Release 2024.2',
      domain: 'Payments',
      wr_number: 'WR-12345',
      application: 'PayGateway',
      total_test_cases: 250,
      executed: 240,
      passed: 225,
      failed: 15,
      pass_pct: 93.8,
      defects_open: 2,
      defects_total: 10,
      rag_status: 'Green',
    },
    {
      program: 'QE Automation',
      release: 'Release 2024.2',
      domain: 'Payments',
      wr_number: 'WR-12345',
      application: 'PayNotify',
      total_test_cases: 250,
      executed: 220,
      passed: 200,
      failed: 20,
      pass_pct: 90.9,
      defects_open: 3,
      defects_total: 5,
      rag_status: 'Green',
    },
    {
      program: 'Platform Modernization',
      release: 'Release 2024.2',
      domain: 'Core Banking',
      wr_number: 'WR-12347',
      application: 'CoreLedger',
      total_test_cases: 300,
      executed: 165,
      passed: 90,
      failed: 75,
      pass_pct: 54.5,
      defects_open: 10,
      defects_total: 25,
      rag_status: 'Red',
    },
    {
      program: 'Platform Modernization',
      release: 'Release 2024.2',
      domain: 'Core Banking',
      wr_number: 'WR-12347',
      application: 'CoreAuth',
      total_test_cases: 300,
      executed: 165,
      passed: 90,
      failed: 75,
      pass_pct: 54.5,
      defects_open: 8,
      defects_total: 15,
      rag_status: 'Red',
    },
  ];
}

function generateMockQualityMetrics() {
  return [
    {
      release: 'Release 2024.2',
      domain: 'Payments',
      defect_density: 0.03,
      defect_removal_efficiency: 88.5,
      test_coverage_pct: 91.2,
      automation_pct: 72.0,
      avg_defect_age_days: 4.2,
      first_pass_yield: 85.0,
    },
    {
      release: 'Release 2024.2',
      domain: 'Lending',
      defect_density: 0.06,
      defect_removal_efficiency: 72.0,
      test_coverage_pct: 80.5,
      automation_pct: 55.0,
      avg_defect_age_days: 6.8,
      first_pass_yield: 70.0,
    },
    {
      release: 'Release 2024.2',
      domain: 'Core Banking',
      defect_density: 0.07,
      defect_removal_efficiency: 60.0,
      test_coverage_pct: 65.0,
      automation_pct: 40.0,
      avg_defect_age_days: 9.5,
      first_pass_yield: 55.0,
    },
  ];
}

function generateMockMonthlyTrends() {
  return [
    { month: 'Jan 2024', total_defects: 45, open: 10, closed: 30, deferred: 5, pass_pct: 82.0 },
    { month: 'Feb 2024', total_defects: 52, open: 15, closed: 32, deferred: 5, pass_pct: 80.0 },
    { month: 'Mar 2024', total_defects: 38, open: 8, closed: 25, deferred: 5, pass_pct: 85.0 },
    { month: 'Apr 2024', total_defects: 60, open: 20, closed: 35, deferred: 5, pass_pct: 78.0 },
    { month: 'May 2024', total_defects: 55, open: 12, closed: 38, deferred: 5, pass_pct: 84.0 },
    { month: 'Jun 2024', total_defects: 42, open: 5, closed: 32, deferred: 5, pass_pct: 90.0 },
  ];
}

function generateMockDefectTrends() {
  return [
    { week: 'W1 May', new_defects: 18, closed_defects: 12, cumulative_open: 30 },
    { week: 'W2 May', new_defects: 14, closed_defects: 16, cumulative_open: 28 },
    { week: 'W3 May', new_defects: 10, closed_defects: 15, cumulative_open: 23 },
    { week: 'W4 May', new_defects: 8, closed_defects: 12, cumulative_open: 19 },
    { week: 'W1 Jun', new_defects: 6, closed_defects: 10, cumulative_open: 15 },
    { week: 'W2 Jun', new_defects: 5, closed_defects: 8, cumulative_open: 12 },
  ];
}

function generateMockSeverityDistribution() {
  return [
    { severity: 'Blocker', count: 8, percentage: 8.7 },
    { severity: 'Critical', count: 15, percentage: 16.3 },
    { severity: 'Major', count: 30, percentage: 32.6 },
    { severity: 'Minor', count: 25, percentage: 27.2 },
    { severity: 'Trivial', count: 14, percentage: 15.2 },
  ];
}

function generateMockEnvironmentDistribution() {
  return [
    { environment: 'SIT', defects: 45, percentage: 48.9 },
    { environment: 'UAT', defects: 25, percentage: 27.2 },
    { environment: 'Performance', defects: 12, percentage: 13.0 },
    { environment: 'Production', defects: 10, percentage: 10.9 },
  ];
}

function generateMockRCACharts() {
  return [
    { category: 'Code Defect', count: 35, percentage: 38.0 },
    { category: 'Requirement Gap', count: 20, percentage: 21.7 },
    { category: 'Environment Issue', count: 15, percentage: 16.3 },
    { category: 'Data Issue', count: 12, percentage: 13.0 },
    { category: 'Configuration', count: 10, percentage: 10.9 },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Read data from localStorage by key. If not found, seed with mock data.
 * @param {string} key - localStorage key
 * @param {Function} mockGenerator - function that returns default mock data
 * @returns {Array<object>}
 */
function readFromStorage(key, mockGenerator) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[DashboardService] Failed to read "${key}" from localStorage:`, err);
  }

  // Seed mock data
  const mockData = mockGenerator();
  try {
    localStorage.setItem(key, JSON.stringify(mockData));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[DashboardService] Failed to seed "${key}" in localStorage:`, err);
  }
  return mockData;
}

/**
 * Apply filter object to an array of records.
 * Only filters on keys that exist in both the filter and the record.
 * Filter values are case-insensitive string matches.
 * @param {Array<object>} data
 * @param {object} filters - e.g. { release: 'Release 2024.2', domain: 'Payments' }
 * @returns {Array<object>}
 */
function applyFilters(data, filters) {
  if (!filters || typeof filters !== 'object') {
    return data;
  }

  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );

  if (activeFilters.length === 0) {
    return data;
  }

  return data.filter((record) =>
    activeFilters.every(([key, filterValue]) => {
      const recordValue = record[key];
      if (recordValue === undefined || recordValue === null) {
        return false;
      }
      return String(recordValue).toLowerCase() === String(filterValue).toLowerCase();
    })
  );
}

/**
 * Simulate async data fetch with a microtask delay.
 * @param {string} storageKey
 * @param {Function} mockGenerator
 * @param {object} [filters]
 * @returns {Promise<Array<object>>}
 */
async function fetchData(storageKey, mockGenerator, filters) {
  // Simulate async behavior
  await Promise.resolve();
  const data = readFromStorage(storageKey, mockGenerator);
  return applyFilters(data, filters);
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * @typedef {object} DashboardFilters
 * @property {string} [release]
 * @property {string} [program]
 * @property {string} [domain]
 * @property {string} [application]
 * @property {string} [wr_number]
 */

const DashboardService = {
  /**
   * Fetch release readiness data.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getReadinessData(filters) {
    return fetchData(STORAGE_KEYS.readiness, generateMockReadiness, filters);
  },

  /**
   * Fetch showstopper defects.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getShowstopperDefects(filters) {
    return fetchData(STORAGE_KEYS.showstopperDefects, generateMockShowstopperDefects, filters);
  },

  /**
   * Fetch deferred defects.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getDeferredDefects(filters) {
    return fetchData(STORAGE_KEYS.deferredDefects, generateMockDeferredDefects, filters);
  },

  /**
   * Fetch SIT defect summary.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getSITDefectSummary(filters) {
    return fetchData(STORAGE_KEYS.sitDefectSummary, generateMockSITDefectSummary, filters);
  },

  /**
   * Fetch domain-wise DSR data.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getDSRDomain(filters) {
    return fetchData(STORAGE_KEYS.dsrDomain, generateMockDSRDomain, filters);
  },

  /**
   * Fetch program-wise DSR data.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getDSRProgram(filters) {
    return fetchData(STORAGE_KEYS.dsrProgram, generateMockDSRProgram, filters);
  },

  /**
   * Fetch program-level status by WR and application.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getProgramStatus(filters) {
    return fetchData(STORAGE_KEYS.programStatus, generateMockProgramStatus, filters);
  },

  /**
   * Fetch overall quality metrics.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getQualityMetrics(filters) {
    return fetchData(STORAGE_KEYS.qualityMetrics, generateMockQualityMetrics, filters);
  },

  /**
   * Fetch monthly QE snapshot / trends.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getMonthlyTrends(filters) {
    return fetchData(STORAGE_KEYS.monthlyTrends, generateMockMonthlyTrends, filters);
  },

  /**
   * Fetch defect trend charts data.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getDefectTrends(filters) {
    return fetchData(STORAGE_KEYS.defectTrends, generateMockDefectTrends, filters);
  },

  /**
   * Fetch defect distribution by severity.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getSeverityDistribution(filters) {
    return fetchData(
      STORAGE_KEYS.severityDistribution,
      generateMockSeverityDistribution,
      filters
    );
  },

  /**
   * Fetch defect distribution by environment.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getEnvironmentDistribution(filters) {
    return fetchData(
      STORAGE_KEYS.environmentDistribution,
      generateMockEnvironmentDistribution,
      filters
    );
  },

  /**
   * Fetch RCA charts data.
   * @param {DashboardFilters} [filters]
   * @returns {Promise<Array<object>>}
   */
  async getRCACharts(filters) {
    return fetchData(STORAGE_KEYS.rcaCharts, generateMockRCACharts, filters);
  },

  /**
   * Update a specific record in a localStorage dataset.
   * Used by EditableFieldManager to persist field edits.
   * @param {string} storageKey - localStorage key (use STORAGE_KEYS)
   * @param {string} entityIdField - the field name used as the entity identifier (e.g. 'wr_number', 'defect_id')
   * @param {string} entityId - the value of the entity identifier
   * @param {string} field - the field to update
   * @param {*} value - the new value
   * @returns {Promise<boolean>}
   */
  async updateRecord(storageKey, entityIdField, entityId, field, value) {
    await Promise.resolve();
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return false;
      }
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        return false;
      }

      let updated = false;
      const updatedData = data.map((record) => {
        if (
          record[entityIdField] !== undefined &&
          String(record[entityIdField]).toLowerCase() === String(entityId).toLowerCase()
        ) {
          updated = true;
          return { ...record, [field]: value };
        }
        return record;
      });

      if (updated) {
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
      }
      return updated;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[DashboardService] Failed to update record in "${storageKey}":`, err);
      return false;
    }
  },

  /**
   * Get the list of available filter values from a dataset.
   * Useful for populating filter dropdowns.
   * @param {string} storageKey
   * @param {Function} mockGenerator
   * @param {string} fieldName
   * @returns {Promise<Array<string>>}
   */
  async getDistinctValues(storageKey, mockGenerator, fieldName) {
    await Promise.resolve();
    const data = readFromStorage(storageKey, mockGenerator);
    const values = new Set();
    data.forEach((record) => {
      if (record[fieldName] !== undefined && record[fieldName] !== null) {
        values.add(String(record[fieldName]));
      }
    });
    return Array.from(values).sort();
  },

  /**
   * Get distinct releases across readiness data.
   * @returns {Promise<Array<string>>}
   */
  async getAvailableReleases() {
    return this.getDistinctValues(STORAGE_KEYS.readiness, generateMockReadiness, 'release');
  },

  /**
   * Get distinct programs across readiness data.
   * @returns {Promise<Array<string>>}
   */
  async getAvailablePrograms() {
    return this.getDistinctValues(STORAGE_KEYS.readiness, generateMockReadiness, 'program');
  },

  /**
   * Get distinct domains across readiness data.
   * @returns {Promise<Array<string>>}
   */
  async getAvailableDomains() {
    return this.getDistinctValues(STORAGE_KEYS.readiness, generateMockReadiness, 'domain');
  },

  /**
   * Clear all dashboard data from localStorage.
   * Useful for testing or reset scenarios.
   */
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(`[DashboardService] Failed to remove "${key}" from localStorage:`, err);
      }
    });
  },

  /**
   * Expose storage keys for external consumers (e.g. EditableFieldManager, UploadProcessor).
   */
  STORAGE_KEYS,
};

export default DashboardService;