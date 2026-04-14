import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const STORAGE_KEY_PREFIX = 'qehub_uploaded_';
const STORAGE_META_KEY = 'qehub_upload_meta';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 5000;

const KNOWN_FIELDS = [
  'release',
  'rag_status',
  'project',
  'team',
  'test_coverage',
  'automation_coverage',
  'defect_count',
  'open_defects',
  'closed_defects',
  'blocker_count',
  'critical_count',
  'environment',
  'status',
  'readiness',
  'notes',
  'owner',
  'sprint',
  'start_date',
  'end_date',
];

const VALID_RAG_VALUES = ['red', 'amber', 'green'];

function detectFileType(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel';
  return null;
}

function normalizeHeaders(headers) {
  return headers.map((h) =>
    String(h || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
  );
}

function validateRows(rows, normalizedHeaders) {
  const errors = [];

  if (rows.length === 0) {
    errors.push({ row: 0, field: '', error: 'File contains no data rows' });
    return errors;
  }

  if (rows.length > MAX_ROWS) {
    errors.push({
      row: 0,
      field: '',
      error: `File contains ${rows.length} rows, maximum allowed is ${MAX_ROWS}`,
    });
    return errors;
  }

  const hasAtLeastOneKnownField = normalizedHeaders.some((h) =>
    KNOWN_FIELDS.includes(h)
  );
  if (!hasAtLeastOneKnownField) {
    errors.push({
      row: 0,
      field: '',
      error:
        'No recognized columns found. Expected at least one of: ' +
        KNOWN_FIELDS.join(', '),
    });
    return errors;
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed, +1 for header row

    if (row.rag_status !== undefined && row.rag_status !== null && row.rag_status !== '') {
      const val = String(row.rag_status).trim().toLowerCase();
      if (!VALID_RAG_VALUES.includes(val)) {
        errors.push({
          row: rowNum,
          field: 'rag_status',
          error: `Invalid value: ${row.rag_status}. Expected one of: Red, Amber, Green`,
        });
      }
    }

    if (row.test_coverage !== undefined && row.test_coverage !== null && row.test_coverage !== '') {
      const num = Number(row.test_coverage);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push({
          row: rowNum,
          field: 'test_coverage',
          error: `Invalid value: ${row.test_coverage}. Expected a number between 0 and 100`,
        });
      }
    }

    if (row.automation_coverage !== undefined && row.automation_coverage !== null && row.automation_coverage !== '') {
      const num = Number(row.automation_coverage);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push({
          row: rowNum,
          field: 'automation_coverage',
          error: `Invalid value: ${row.automation_coverage}. Expected a number between 0 and 100`,
        });
      }
    }

    const intFields = ['defect_count', 'open_defects', 'closed_defects', 'blocker_count', 'critical_count'];
    intFields.forEach((field) => {
      if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
        const num = Number(row[field]);
        if (isNaN(num) || !Number.isInteger(num) || num < 0) {
          errors.push({
            row: rowNum,
            field,
            error: `Invalid value: ${row[field]}. Expected a non-negative integer`,
          });
        }
      }
    });
  });

  return errors;
}

function parseRowsFromRawData(rawRows, normalizedHeaders) {
  return rawRows.map((rawRow) => {
    const row = {};
    normalizedHeaders.forEach((header, colIdx) => {
      if (KNOWN_FIELDS.includes(header)) {
        const value = Array.isArray(rawRow) ? rawRow[colIdx] : rawRow[header];
        row[header] = value !== undefined && value !== null ? String(value).trim() : '';
      }
    });
    return row;
  });
}

function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete(results) {
        try {
          if (!results.data || results.data.length === 0) {
            resolve({ rows: [], normalizedHeaders: [], errors: [{ row: 0, field: '', error: 'File is empty' }] });
            return;
          }

          const rawHeaders = results.data[0];
          const normalizedHeaders = normalizeHeaders(rawHeaders);
          const dataRows = results.data.slice(1);
          const rows = parseRowsFromRawData(dataRows, normalizedHeaders);
          resolve({ rows, normalizedHeaders, errors: [] });
        } catch (err) {
          reject(err);
        }
      },
      error(err) {
        reject(new Error('CSV parse error: ' + err.message));
      },
    });
  });
}

function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ rows: [], normalizedHeaders: [], errors: [{ row: 0, field: '', error: 'Excel file has no sheets' }] });
          return;
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rawData || rawData.length === 0) {
          resolve({ rows: [], normalizedHeaders: [], errors: [{ row: 0, field: '', error: 'Sheet is empty' }] });
          return;
        }

        const rawHeaders = rawData[0];
        const normalizedHeaders = normalizeHeaders(rawHeaders);
        const dataRows = rawData.slice(1).filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '')
        );
        const rows = parseRowsFromRawData(dataRows, normalizedHeaders);
        resolve({ rows, normalizedHeaders, errors: [] });
      } catch (err) {
        reject(new Error('Excel parse error: ' + err.message));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsArrayBuffer(file);
  });
}

function saveMeta(meta) {
  try {
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.error('Failed to save upload metadata:', err);
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save uploaded data:', err);
    throw new Error('Failed to persist uploaded data. localStorage may be full.');
  }
}

/**
 * Processes an uploaded file (Excel or CSV), validates it, and stores parsed data in localStorage.
 * @param {File} file - The file to process
 * @param {string} [dataTypeKey='default'] - The key under which to store the parsed data
 * @returns {Promise<{success: boolean, rows: object[], errors: object[], meta: object|null}>}
 */
export async function processUpload(file, dataTypeKey = 'default') {
  if (!file) {
    return {
      success: false,
      rows: [],
      errors: [{ row: 0, field: '', error: 'No file provided' }],
      meta: null,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      success: false,
      rows: [],
      errors: [{ row: 0, field: '', error: `File size (${sizeMB}MB) exceeds maximum allowed size of 10MB` }],
      meta: null,
    };
  }

  const fileType = detectFileType(file);
  if (!fileType) {
    return {
      success: false,
      rows: [],
      errors: [{ row: 0, field: '', error: 'Unsupported file type. Please upload a .csv, .xlsx, or .xls file' }],
      meta: null,
    };
  }

  try {
    let parseResult;
    if (fileType === 'csv') {
      parseResult = await parseCSVFile(file);
    } else {
      parseResult = await parseExcelFile(file);
    }

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        rows: [],
        errors: parseResult.errors,
        meta: null,
      };
    }

    const validationErrors = validateRows(parseResult.rows, parseResult.normalizedHeaders);
    if (validationErrors.length > 0) {
      return {
        success: false,
        rows: [],
        errors: validationErrors,
        meta: null,
      };
    }

    const meta = {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      rowCount: parseResult.rows.length,
      columns: parseResult.normalizedHeaders.filter((h) => KNOWN_FIELDS.includes(h)),
      dataTypeKey,
      uploadedAt: Date.now(),
    };

    saveData(dataTypeKey, parseResult.rows);
    saveMeta(meta);

    return {
      success: true,
      rows: parseResult.rows,
      errors: [],
      meta,
    };
  } catch (err) {
    return {
      success: false,
      rows: [],
      errors: [{ row: 0, field: '', error: err.message || 'An unexpected error occurred during file processing' }],
      meta: null,
    };
  }
}

/**
 * Returns metadata about the last successful upload.
 * @returns {object|null} Upload metadata or null if no upload has been performed
 */
export function getLastUpload() {
  try {
    const raw = localStorage.getItem(STORAGE_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read upload metadata:', err);
    return null;
  }
}

/**
 * Returns the uploaded data for a given data type key.
 * @param {string} [dataTypeKey='default'] - The key under which the data was stored
 * @returns {object[]|null} Parsed row data or null if not found
 */
export function getUploadedData(dataTypeKey = 'default') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + dataTypeKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read uploaded data:', err);
    return null;
  }
}

/**
 * Clears uploaded data and metadata from localStorage.
 * @param {string} [dataTypeKey='default'] - The key under which the data was stored. If not provided, clears default.
 */
export function clearUploadedData(dataTypeKey = 'default') {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + dataTypeKey);
    const meta = getLastUpload();
    if (meta && meta.dataTypeKey === dataTypeKey) {
      localStorage.removeItem(STORAGE_META_KEY);
    }
  } catch (err) {
    console.error('Failed to clear uploaded data:', err);
  }
}

const UploadProcessor = {
  processUpload,
  getLastUpload,
  getUploadedData,
  clearUploadedData,
};

export default UploadProcessor;