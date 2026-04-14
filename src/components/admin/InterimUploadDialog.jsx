import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import { parseFile, validateFileType, validateFileSize, MAX_FILE_SIZE } from '../../services/uploadService';
import { UploadProcessor } from '../../services/UploadProcessor';

const DATA_TYPE_OPTIONS = [
  { value: 'release_readiness', label: 'Release Readiness' },
  { value: 'defect_data', label: 'Defect Data' },
  { value: 'test_execution', label: 'Test Execution Summary' },
  { value: 'program_status', label: 'Program Status' },
  { value: 'sit_defects', label: 'SIT Defects' },
];

const ACCEPTED_EXTENSIONS = '.xlsx,.xls,.csv';
const ACCEPTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];

/**
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * InterimUploadDialog - Admin-only modal for uploading Excel/CSV data
 * to temporarily populate dashboards before backend integrations.
 */
export default function InterimUploadDialog({ isOpen, onClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataType, setDataType] = useState('release_readiness');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle | validating | parsing | processing | success | error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [rowCount, setRowCount] = useState(0);

  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';
  const isAdmin = userRole === 'manager';

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setDataType('release_readiness');
    setIsDragging(false);
    setUploadState('idle');
    setProgress(0);
    setErrorMessage('');
    setParsedData(null);
    setRowCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Validates and sets the selected file
   * @param {File} file
   */
  const handleFileSelect = useCallback((file) => {
    setErrorMessage('');
    setUploadState('idle');
    setParsedData(null);
    setRowCount(0);

    if (!validateFileType(file)) {
      setErrorMessage('Invalid file type. Please upload an .xlsx, .xls, or .csv file.');
      setSelectedFile(null);
      return;
    }

    if (!validateFileSize(file)) {
      setErrorMessage(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setRowCount(0);
    setUploadState('idle');
    setErrorMessage('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !isAdmin) return;

    try {
      setUploadState('validating');
      setProgress(10);
      setErrorMessage('');

      // Validate file type and size again
      if (!validateFileType(selectedFile)) {
        throw new Error('Invalid file type. Please upload an .xlsx, .xls, or .csv file.');
      }
      if (!validateFileSize(selectedFile)) {
        throw new Error(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      }

      setUploadState('parsing');
      setProgress(30);

      // Parse the file
      const data = await parseFile(selectedFile);
      setProgress(60);

      if (!data || data.length === 0) {
        throw new Error('The file contains no data rows. Please check the file and try again.');
      }

      setUploadState('processing');
      setProgress(80);

      // Process and store the data
      const processor = new UploadProcessor();
      const result = processor.process(data, dataType);

      setProgress(100);
      setParsedData(data);
      setRowCount(result?.rowCount ?? data.length);
      setUploadState('success');

      if (onUploadComplete) {
        onUploadComplete({
          dataType,
          rowCount: result?.rowCount ?? data.length,
          filename: selectedFile.name,
        });
      }
    } catch (error) {
      console.error('[InterimUploadDialog] Upload error:', error);
      setUploadState('error');
      setErrorMessage(error.message || 'An unexpected error occurred during upload.');
      setProgress(0);
    }
  }, [selectedFile, dataType, isAdmin, onUploadComplete]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isAdmin) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Access Denied"
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <AlertCircle className="h-12 w-12 text-danger-500" />
          <p className="text-surface-700 text-center">
            Only administrators can upload interim data.
          </p>
        </div>
      </Modal>
    );
  }

  const isUploading = uploadState === 'validating' || uploadState === 'parsing' || uploadState === 'processing';
  const canUpload = selectedFile && !isUploading && uploadState !== 'success';

  const modalActions = [];

  if (uploadState === 'success') {
    modalActions.push({
      label: 'Done',
      variant: 'primary',
      onClick: onClose,
    });
  } else {
    modalActions.push({
      label: 'Cancel',
      variant: 'secondary',
      onClick: onClose,
      disabled: isUploading,
    });
    modalActions.push({
      label: isUploading ? 'Uploading...' : 'Upload & Process',
      variant: 'primary',
      onClick: handleUpload,
      disabled: !canUpload,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isUploading ? undefined : onClose}
      title="Upload Interim Data"
      size="lg"
      actions={modalActions}
    >
      <div className="space-y-6">
        {/* Data Type Selector */}
        <div>
          <label
            htmlFor="data-type-select"
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            Data Type
          </label>
          <select
            id="data-type-select"
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            disabled={isUploading || uploadState === 'success'}
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {DATA_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-surface-500">
            Select which dashboard data this upload will update.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        {uploadState !== 'success' && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={!selectedFile ? handleBrowseClick : undefined}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !selectedFile) {
                e.preventDefault();
                handleBrowseClick();
              }
            }}
            aria-label="File upload drop zone"
            className={`
              relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors
              ${isDragging
                ? 'border-brand-500 bg-brand-50'
                : selectedFile
                  ? 'border-surface-300 bg-surface-50'
                  : 'border-surface-300 bg-white hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer'
              }
              ${isUploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleInputChange}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />

            {!selectedFile ? (
              <>
                <Upload className="h-10 w-10 text-surface-400 mb-3" />
                <p className="text-sm font-medium text-surface-700">
                  Drag & drop your file here, or{' '}
                  <span className="text-brand-600 underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-surface-500">
                  Supports .xlsx, .xls, .csv — Max {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 rounded-lg bg-brand-50 p-2.5">
                  <FileSpreadsheet className="h-6 w-6 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-surface-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="flex-shrink-0 rounded-lg p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                    aria-label="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        {isUploading && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-surface-700">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                {uploadState === 'validating' && 'Validating file...'}
                {uploadState === 'parsing' && 'Parsing data...'}
                {uploadState === 'processing' && 'Processing and storing data...'}
              </span>
              <span className="text-surface-500 font-mono text-xs">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {uploadState === 'success' && (
          <div className="flex items-start gap-3 rounded-xl bg-success-50 border border-success-200 p-4 animate-fade-in">
            <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success-800">
                Upload successful
              </p>
              <p className="mt-1 text-xs text-success-700">
                {rowCount} row{rowCount !== 1 ? 's' : ''} of{' '}
                <span className="font-medium">
                  {DATA_TYPE_OPTIONS.find((o) => o.value === dataType)?.label ?? dataType}
                </span>{' '}
                data have been processed from{' '}
                <span className="font-mono">{selectedFile?.name}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {(uploadState === 'error' || (errorMessage && uploadState === 'idle')) && (
          <div className="flex items-start gap-3 rounded-xl bg-danger-50 border border-danger-200 p-4 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger-800">
                {uploadState === 'error' ? 'Upload failed' : 'Validation error'}
              </p>
              <p className="mt-1 text-xs text-danger-700">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Data Preview (on success) */}
        {uploadState === 'success' && parsedData && parsedData.length > 0 && (
          <div className="animate-fade-in">
            <p className="text-xs font-medium text-surface-500 mb-2">
              Preview (first {Math.min(parsedData.length, 5)} rows)
            </p>
            <div className="overflow-x-auto rounded-lg border border-surface-200">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-surface-50">
                    {Object.keys(parsedData[0]).slice(0, 6).map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 text-left font-medium text-surface-600 whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                    {Object.keys(parsedData[0]).length > 6 && (
                      <th className="px-3 py-2 text-left font-medium text-surface-400">
                        ...
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'}
                    >
                      {Object.keys(parsedData[0]).slice(0, 6).map((key) => (
                        <td
                          key={key}
                          className="px-3 py-1.5 text-surface-700 whitespace-nowrap max-w-[200px] truncate"
                        >
                          {row[key] != null ? String(row[key]) : '—'}
                        </td>
                      ))}
                      {Object.keys(parsedData[0]).length > 6 && (
                        <td className="px-3 py-1.5 text-surface-400">…</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

InterimUploadDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUploadComplete: PropTypes.func,
};

InterimUploadDialog.defaultProps = {
  onUploadComplete: null,
};