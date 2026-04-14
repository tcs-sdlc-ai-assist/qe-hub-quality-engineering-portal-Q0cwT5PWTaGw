const JIRA_BASE_URL = import.meta.env.VITE_JIRA_URL || 'https://jira.company.com';
const ELASTIC_BASE_URL = import.meta.env.VITE_ELASTIC_URL || 'https://elastic.company.com';
const CONFLUENCE_BASE_URL = import.meta.env.VITE_CONFLUENCE_URL || 'https://confluence.company.com';

const EMBED_CONFIGS = {
  jira_defect_dashboard: {
    source: 'jira',
    title: 'Jira Defect Dashboard',
    path: '/plugins/servlet/gadgets/ifr?container=atlassian&mid=0&country=US&lang=en&view=default&url=rest/gadgets/1.0/g/com.atlassian.jira.gadgets:filter-results-gadget/gadgets/filter-results-gadget.xml',
    sandbox: 'allow-scripts allow-same-origin allow-popups',
    width: '100%',
    height: '600px',
    description: 'Live Jira defect tracking dashboard',
  },
  jira_sprint_board: {
    source: 'jira',
    title: 'Jira Sprint Board',
    path: '/secure/RapidBoard.jspa?rapidView=1',
    sandbox: 'allow-scripts allow-same-origin allow-popups',
    width: '100%',
    height: '700px',
    description: 'Current sprint board from Jira',
  },
  elastic_test_metrics: {
    source: 'elastic',
    title: 'Elastic Test Metrics',
    path: '/app/dashboards#/view/test-metrics-dashboard',
    sandbox: 'allow-scripts allow-same-origin',
    width: '100%',
    height: '600px',
    description: 'Test execution metrics from Elastic/Kibana',
  },
  elastic_defect_analytics: {
    source: 'elastic',
    title: 'Elastic Defect Analytics',
    path: '/app/dashboards#/view/defect-analytics-dashboard',
    sandbox: 'allow-scripts allow-same-origin',
    width: '100%',
    height: '650px',
    description: 'Defect analytics and trends from Elastic/Kibana',
  },
  elastic_environment_health: {
    source: 'elastic',
    title: 'Environment Health Dashboard',
    path: '/app/dashboards#/view/environment-health',
    sandbox: 'allow-scripts allow-same-origin',
    width: '100%',
    height: '550px',
    description: 'Environment health and availability metrics',
  },
};

const STORAGE_KEY = 'embed_configs_custom';

/**
 * Returns the base URL for a given source
 * @param {string} source - 'jira' | 'elastic' | 'confluence'
 * @returns {string}
 */
function getBaseUrl(source) {
  switch (source) {
    case 'jira':
      return JIRA_BASE_URL;
    case 'elastic':
      return ELASTIC_BASE_URL;
    case 'confluence':
      return CONFLUENCE_BASE_URL;
    default:
      return '';
  }
}

/**
 * Loads any custom embed configs from localStorage
 * @returns {Object}
 */
function getCustomConfigs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom embed configs:', err);
    return {};
  }
}

/**
 * Returns the merged embed configs (defaults + custom overrides)
 * @returns {Object}
 */
function getMergedConfigs() {
  const custom = getCustomConfigs();
  return { ...EMBED_CONFIGS, ...custom };
}

/**
 * Returns the full embed URL for a given dashboard ID
 * @param {string} dashboardId - The dashboard identifier key
 * @returns {string|null} The full URL or null if not found
 */
export function getEmbedUrl(dashboardId) {
  const configs = getMergedConfigs();
  const config = configs[dashboardId];

  if (!config) {
    console.warn(`Embed config not found for dashboard: ${dashboardId}`);
    return null;
  }

  const baseUrl = getBaseUrl(config.source);
  if (!baseUrl) {
    console.warn(`No base URL configured for source: ${config.source}`);
    return null;
  }

  const path = config.path || '';
  const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

  return fullUrl;
}

/**
 * Validates an embed URL for security and format
 * @param {string} url - The URL to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateEmbedUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required and must be a string' };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    const dangerousPatterns = [
      'javascript:',
      'data:',
      'vbscript:',
      '<script',
      'onerror=',
      'onload=',
    ];

    const lowerUrl = trimmed.toLowerCase();
    for (const pattern of dangerousPatterns) {
      if (lowerUrl.includes(pattern)) {
        return { valid: false, error: `URL contains potentially dangerous content: ${pattern}` };
      }
    }

    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Returns the embed configuration for a given dashboard ID
 * @param {string} dashboardId - The dashboard identifier key
 * @returns {{sandbox: string, width: string, height: string, title: string, source: string, description: string}|null}
 */
export function getEmbedConfig(dashboardId) {
  const configs = getMergedConfigs();
  const config = configs[dashboardId];

  if (!config) {
    return null;
  }

  return {
    source: config.source || 'unknown',
    title: config.title || dashboardId,
    description: config.description || '',
    sandbox: config.sandbox || 'allow-scripts allow-same-origin',
    width: config.width || '100%',
    height: config.height || '600px',
  };
}

/**
 * Returns a list of all available embeddable dashboards
 * @returns {Array<{id: string, source: string, title: string, description: string, url: string|null}>}
 */
export function getAvailableEmbeds() {
  const configs = getMergedConfigs();

  return Object.keys(configs).map((id) => {
    const config = configs[id];
    const url = getEmbedUrl(id);

    return {
      id,
      source: config.source || 'unknown',
      title: config.title || id,
      description: config.description || '',
      url,
    };
  });
}

/**
 * Saves a custom embed configuration
 * @param {string} dashboardId - The dashboard identifier key
 * @param {Object} config - The embed configuration
 * @param {string} config.source - 'jira' | 'elastic' | 'confluence'
 * @param {string} config.title - Display title
 * @param {string} config.path - URL path or full URL
 * @param {string} [config.sandbox] - iframe sandbox attributes
 * @param {string} [config.width] - iframe width
 * @param {string} [config.height] - iframe height
 * @param {string} [config.description] - Description
 * @returns {{success: boolean, error: string|null}}
 */
export function saveCustomEmbed(dashboardId, config) {
  if (!dashboardId || typeof dashboardId !== 'string') {
    return { success: false, error: 'Dashboard ID is required' };
  }

  if (!config || typeof config !== 'object') {
    return { success: false, error: 'Configuration object is required' };
  }

  if (!config.source || !['jira', 'elastic', 'confluence'].includes(config.source)) {
    return { success: false, error: 'Source must be one of: jira, elastic, confluence' };
  }

  if (!config.title || typeof config.title !== 'string') {
    return { success: false, error: 'Title is required' };
  }

  if (!config.path || typeof config.path !== 'string') {
    return { success: false, error: 'Path is required' };
  }

  if (config.path.startsWith('http')) {
    const validation = validateEmbedUrl(config.path);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
  }

  try {
    const custom = getCustomConfigs();
    custom[dashboardId] = {
      source: config.source,
      title: config.title,
      path: config.path,
      sandbox: config.sandbox || 'allow-scripts allow-same-origin',
      width: config.width || '100%',
      height: config.height || '600px',
      description: config.description || '',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return { success: true, error: null };
  } catch (err) {
    console.error('Failed to save custom embed config:', err);
    return { success: false, error: `Failed to save configuration: ${err.message}` };
  }
}

/**
 * Removes a custom embed configuration
 * @param {string} dashboardId - The dashboard identifier key
 * @returns {{success: boolean, error: string|null}}
 */
export function removeCustomEmbed(dashboardId) {
  if (!dashboardId || typeof dashboardId !== 'string') {
    return { success: false, error: 'Dashboard ID is required' };
  }

  try {
    const custom = getCustomConfigs();
    if (!custom[dashboardId]) {
      return { success: false, error: `Custom embed "${dashboardId}" not found` };
    }
    delete custom[dashboardId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return { success: true, error: null };
  } catch (err) {
    console.error('Failed to remove custom embed config:', err);
    return { success: false, error: `Failed to remove configuration: ${err.message}` };
  }
}