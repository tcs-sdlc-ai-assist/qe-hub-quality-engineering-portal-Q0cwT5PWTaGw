import { UploadProcessor } from './UploadProcessor.js';
import { AuditLogManager } from './AuditLogManager.js';

const UPLOAD_HISTORY_KEY = 'uploadHistory_v1';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.xlsx', '.csv'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

/**
 * Generate a unique upload ID
 * @returns {string}
 */
function generateUploadId() {
  return 'upload-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Get file extension from a filename
 * @param {string} filename
 * @returns {string} Lowercase extension including the dot
 */
function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return filename.substring(lastDot).toLowerCase();
}

/**
 * Read upload history from localStorage
 * @returns {Array<object>}
 */
function readUploadHistory() {
  try {
    const raw = localStorage.getItem(UPLOAD_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('[uploadService] Failed to read upload history:', error);
  }
  return [];
}

/**
 * Write upload history to localStorage
 * @param {Array<object>} history
 */
function writeUploadHistory(history) {
  try {
    localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('[uploadService] Failed to write upload history:', error);
  }
}

/**
 * Add an entry to upload history
 * @param {object} entry
 */
function addHistoryEntry(entry) {
  const history = readUploadHistory();
  history.unshift(entry);
  // Keep only the last 50 entries
  if (history.length > 50) {
    history.length = 50;
  }
  writeUploadHistory(history);
}

/**
 * Validate a file before upload - checks type and size.
 * @param {File} file
 * @returns {{ valid: boolean, errors: Array<string> }}
 */
export function validateFileBeforeUpload(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  if (!(file instanceof File) && !(file instanceof Blob)) {
    errors.push('Invalid file object');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    errors.push(
      `File size (${sizeMB} MB) exceeds the maximum allowed size of 5 MB`
    );
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push(
      `File type "${extension || 'unknown'}" is not supported. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  // Check MIME type (if available and not empty)
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    // Some browsers may not set MIME type correctly, so only warn
    console.warn(
      `[uploadService] Unexpected MIME type: ${file.type}. Proceeding based on extension.`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Handle a file upload: validates, processes via UploadProcessor,
 * logs audit entry, persists to localStorage, and returns result.
 *
 * @param {File} file - The file to upload
 * @param {string} dashboardId - The target dashboard/entity type
 * @param {string} userId - The user performing the upload
 * @param {object} [options] - Optional configuration
 * @param {function} [options.onProgress] - Progress callback (0-100)
 * @param {object} [options.schemaMapping] - Custom field mapping
 * @returns {Promise<object>} Upload result with status, rows, and uploadId
 */
export async function handleFileUpload(file, dashboardId, userId, options = {}) {
  const uploadId = generateUploadId();
  const startTime = Date.now();
  const { onProgress, schemaMapping } = options;

  // Step 1: Validate file
  const validation = validateFileBeforeUpload(file);
  if (!validation.valid) {
    const historyEntry = {
      uploadId,
      filename: file ? file.name : 'unknown',
      dashboardId,
      userId,
      status: 'failed',
      errors: validation.errors,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      rowCount: 0,
    };
    addHistoryEntry(historyEntry);

    return {
      status: 'error',
      uploadId,
      errors: validation.errors,
      rows: 0,
    };
  }

  if (onProgress) {
    onProgress(10);
  }

  // Step 2: Parse file via UploadProcessor
  let parsedData;
  try {
    parsedData = await UploadProcessor.parseFile(file, {
      schemaMapping,
      onProgress: (pct) => {
        if (onProgress) {
          // Map processor progress (0-100) to overall progress (10-70)
          onProgress(10 + Math.round(pct * 0.6));
        }
      },
    });
  } catch (parseError) {
    console.error('[uploadService] File parsing failed:', parseError);

    const historyEntry = {
      uploadId,
      filename: file.name,
      dashboardId,
      userId,
      status: 'failed',
      errors: [parseError.message || 'Failed to parse file'],
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      rowCount: 0,
    };
    addHistoryEntry(historyEntry);

    return {
      status: 'error',
      uploadId,
      errors: [parseError.message || 'Failed to parse file'],
      rows: 0,
    };
  }

  if (onProgress) {
    onProgress(75);
  }

  // Step 3: Validate parsed data
  if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
    const historyEntry = {
      uploadId,
      filename: file.name,
      dashboardId,
      userId,
      status: 'failed',
      errors: ['File contains no data rows'],
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      rowCount: 0,
    };
    addHistoryEntry(historyEntry);

    return {
      status: 'error',
      uploadId,
      errors: ['File contains no data rows'],
      rows: 0,
    };
  }

  if (onProgress) {
    onProgress(80);
  }

  // Step 4: Persist to localStorage as interim data
  try {
    const interimKey = 'interimData_v1';
    let interimData = {};
    try {
      const raw = localStorage.getItem(interimKey);
      if (raw) {
        interimData = JSON.parse(raw);
      }
    } catch {
      interimData = {};
    }

    interimData[dashboardId] = {
      data: parsedData,
      uploadId,
      filename: file.name,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      rowCount: parsedData.length,
    };

    localStorage.setItem(interimKey, JSON.stringify(interimData));
  } catch (storageError) {
    console.error('[uploadService] Failed to persist interim data:', storageError);

    const historyEntry = {
      uploadId,
      filename: file.name,
      dashboardId,
      userId,
      status: 'failed',
      errors: ['Failed to save data to local storage'],
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      rowCount: parsedData.length,
    };
    addHistoryEntry(historyEntry);

    return {
      status: 'error',
      uploadId,
      errors: ['Failed to save data to local storage'],
      rows: parsedData.length,
    };
  }

  if (onProgress) {
    onProgress(90);
  }

  // Step 5: Log audit entry
  try {
    AuditLogManager.logEntry({
      action: 'FILE_UPLOAD',
      entityType: dashboardId,
      entityId: uploadId,
      field: 'interim_data',
      previousValue: null,
      newValue: `${file.name} (${parsedData.length} rows)`,
      userId,
      userRole: null,
      timestamp: new Date().toISOString(),
    });
  } catch (auditError) {
    console.warn('[uploadService] Audit log failed (non-blocking):', auditError);
  }

  // Step 6: Record success in history
  const durationMs = Date.now() - startTime;
  const historyEntry = {
    uploadId,
    filename: file.name,
    dashboardId,
    userId,
    status: 'success',
    errors: [],
    timestamp: new Date().toISOString(),
    durationMs,
    rowCount: parsedData.length,
  };
  addHistoryEntry(historyEntry);

  if (onProgress) {
    onProgress(100);
  }

  return {
    status: 'success',
    uploadId,
    rows: parsedData.length,
    filename: file.name,
    dashboardId,
    durationMs,
  };
}

/**
 * Get upload history, optionally filtered by dashboardId
 * @param {string} [dashboardId] - Optional filter
 * @returns {Array<object>}
 */
export function getUploadHistory(dashboardId) {
  const history = readUploadHistory();
  if (dashboardId) {
    return history.filter((entry) => entry.dashboardId === dashboardId);
  }
  return history;
}

/**
 * Get the status of a specific upload by ID
 * @param {string} uploadId
 * @returns {object|null} The upload history entry, or null if not found
 */
export function getUploadStatus(uploadId) {
  if (!uploadId) {
    return null;
  }
  const history = readUploadHistory();
  return history.find((entry) => entry.uploadId === uploadId) || null;
}

/**
 * Get the most recent upload for a given dashboard
 * @param {string} dashboardId
 * @returns {object|null}
 */
export function getLatestUpload(dashboardId) {
  if (!dashboardId) {
    return null;
  }
  const history = readUploadHistory();
  return history.find((entry) => entry.dashboardId === dashboardId) || null;
}

/**
 * Clear upload history
 * @param {string} [dashboardId] - If provided, only clear history for this dashboard
 */
export function clearUploadHistory(dashboardId) {
  if (dashboardId) {
    const history = readUploadHistory();
    const filtered = history.filter((entry) => entry.dashboardId !== dashboardId);
    writeUploadHistory(filtered);
  } else {
    writeUploadHistory([]);
  }
}