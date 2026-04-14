import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, ExternalLink, RefreshCw, Monitor, Loader2 } from 'lucide-react';
import { getEmbedUrl, getEmbedConfig, EMBED_SOURCES } from '../../services/embeddingService';

const DEFAULT_SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-forms';

const SOURCE_LABELS = {
  [EMBED_SOURCES.JIRA]: 'Jira',
  [EMBED_SOURCES.ELASTIC]: 'Elastic',
  [EMBED_SOURCES.CONFLUENCE]: 'Confluence',
};

/**
 * EmbeddingDashboard — renders external dashboards (Jira, Elastic, Confluence)
 * in sandboxed iframes with loading state, error fallback, and retry.
 */
export default function EmbeddingDashboard({
  source,
  dashboardUrl,
  dashboardId,
  title,
  height,
  sandbox,
  className,
  onLoad,
  onError,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  const resolvedUrl = dashboardUrl || getEmbedUrl(source, dashboardId);
  const sourceLabel = SOURCE_LABELS[source] || source || 'External';
  const displayTitle = title || `${sourceLabel} Dashboard`;

  const handleLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLoading(false);
    setError(null);
    if (onLoad) {
      onLoad({ source, dashboardId, url: resolvedUrl });
    }
  }, [source, dashboardId, resolvedUrl, onLoad]);

  const handleError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const errorMsg = `Failed to load ${sourceLabel} dashboard.`;
    setLoading(false);
    setError(errorMsg);
    if (onError) {
      onError({ source, dashboardId, url: resolvedUrl, error: errorMsg });
    }
  }, [source, dashboardId, resolvedUrl, sourceLabel, onError]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!resolvedUrl) {
      setLoading(false);
      setError(`No URL configured for ${sourceLabel} dashboard.`);
      return;
    }

    setLoading(true);
    setError(null);

    // Set a load timeout — if iframe doesn't fire onLoad within 30s, treat as error
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(`${sourceLabel} dashboard took too long to load.`);
      if (onError) {
        onError({ source, dashboardId, url: resolvedUrl, error: 'Load timeout' });
      }
    }, 30000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [resolvedUrl, retryCount, sourceLabel, source, dashboardId, onError]);

  const embedConfig = getEmbedConfig(source);
  const resolvedSandbox = sandbox || embedConfig.sandbox || DEFAULT_SANDBOX;
  const resolvedHeight = height || embedConfig.height || '600px';

  if (!resolvedUrl && !loading) {
    return (
      <div className={`bg-white rounded-xl shadow-card p-6 ${className || ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50">
            <Monitor className="w-5 h-5 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">{displayTitle}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-warning-500 mb-3" />
          <p className="text-surface-700 font-medium mb-1">No Dashboard URL Configured</p>
          <p className="text-sm text-surface-500 max-w-md">
            The {sourceLabel} dashboard URL has not been configured. Please set the appropriate
            environment variable or provide a dashboard URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-card overflow-hidden transition-shadow hover:shadow-card-hover ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50">
            <Monitor className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900">{displayTitle}</h3>
            <p className="text-xs text-surface-500 font-mono truncate max-w-xs">{resolvedUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label="Retry loading dashboard"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            aria-label={`Open ${displayTitle} in new tab`}
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="relative" style={{ height: resolvedHeight }}>
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white animate-fade-in">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
              <p className="text-sm font-medium text-surface-600">
                Loading {sourceLabel} dashboard…
              </p>
              {retryCount > 0 && (
                <p className="text-xs text-surface-400">Attempt {retryCount + 1}</p>
              )}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white animate-fade-in">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-50">
                <AlertTriangle className="w-8 h-8 text-danger-500" />
              </div>
              <p className="text-surface-900 font-semibold">Unable to Load Dashboard</p>
              <p className="text-sm text-surface-500 max-w-md">{error}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Directly
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Iframe */}
        {resolvedUrl && (
          <iframe
            ref={iframeRef}
            key={`${resolvedUrl}-${retryCount}`}
            src={resolvedUrl}
            title={displayTitle}
            sandbox={resolvedSandbox}
            className="w-full h-full border-0"
            style={{ display: loading || error ? 'none' : 'block' }}
            onLoad={handleLoad}
            onError={handleError}
            allow="clipboard-read; clipboard-write"
            referrerPolicy="no-referrer"
            aria-label={`${sourceLabel} embedded dashboard`}
          />
        )}
      </div>
    </div>
  );
}

EmbeddingDashboard.propTypes = {
  /** Embed source type: 'jira', 'elastic', or 'confluence' */
  source: PropTypes.oneOf([EMBED_SOURCES.JIRA, EMBED_SOURCES.ELASTIC, EMBED_SOURCES.CONFLUENCE]),
  /** Direct URL to embed. Overrides source + dashboardId resolution. */
  dashboardUrl: PropTypes.string,
  /** Dashboard identifier used with source to resolve URL via embeddingService */
  dashboardId: PropTypes.string,
  /** Display title for the embedded dashboard */
  title: PropTypes.string,
  /** Height of the iframe container (CSS value) */
  height: PropTypes.string,
  /** Iframe sandbox attribute value */
  sandbox: PropTypes.string,
  /** Additional CSS classes for the outer container */
  className: PropTypes.string,
  /** Callback when iframe loads successfully */
  onLoad: PropTypes.func,
  /** Callback when iframe fails to load */
  onError: PropTypes.func,
};

EmbeddingDashboard.defaultProps = {
  source: undefined,
  dashboardUrl: undefined,
  dashboardId: undefined,
  title: undefined,
  height: undefined,
  sandbox: undefined,
  className: '',
  onLoad: undefined,
  onError: undefined,
};