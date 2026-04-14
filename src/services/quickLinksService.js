const STORAGE_KEY = 'quickLinks_v1';

const DEFAULT_QUICK_LINKS = [
  {
    id: 'default-1',
    title: 'QE Quality Management',
    url: 'https://confluence.company.com/qe-quality',
    icon: 'book',
    category: 'confluence',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    title: 'QE Tools & Framework Hub',
    url: 'https://confluence.company.com/qe-tools',
    icon: 'wrench',
    category: 'confluence',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    title: 'Test Strategy & Standards',
    url: 'https://confluence.company.com/qe-standards',
    icon: 'file-text',
    category: 'confluence',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-4',
    title: 'Release Readiness Checklist',
    url: 'https://confluence.company.com/release-checklist',
    icon: 'check-square',
    category: 'resource',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-5',
    title: 'Defect Triage Process',
    url: 'https://confluence.company.com/defect-triage',
    icon: 'alert-triangle',
    category: 'confluence',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Generate a unique ID for a quick link
 * @returns {string}
 */
function generateId() {
  return 'ql-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Read quick links from localStorage, returning defaults if none exist
 * @returns {Array<object>}
 */
function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('[quickLinksService] Failed to read from localStorage:', error);
  }
  return [...DEFAULT_QUICK_LINKS];
}

/**
 * Write quick links to localStorage
 * @param {Array<object>} links
 */
function writeToStorage(links) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error('[quickLinksService] Failed to write to localStorage:', error);
    throw new Error('LOCALSTORAGE_ERROR');
  }
}

/**
 * Validate a quick link URL - must be HTTPS
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate a quick link object
 * @param {object} link
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateQuickLink(link) {
  if (!link || typeof link !== 'object') {
    return { valid: false, error: 'Link must be an object' };
  }
  if (!link.title || typeof link.title !== 'string' || link.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }
  if (link.title.trim().length > 200) {
    return { valid: false, error: 'Title must be 200 characters or fewer' };
  }
  if (!isValidUrl(link.url)) {
    return { valid: false, error: 'URL must be a valid HTTPS URL' };
  }
  return { valid: true, error: null };
}

/**
 * Get all quick links from localStorage
 * @returns {Array<object>}
 */
export function getQuickLinks() {
  return readFromStorage();
}

/**
 * Set all quick links (replace entire list)
 * @param {Array<object>} links
 */
export function setQuickLinks(links) {
  if (!Array.isArray(links)) {
    throw new Error('Links must be an array');
  }
  for (const link of links) {
    const validation = validateQuickLink(link);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }
  writeToStorage(links);
}

/**
 * Add a new quick link
 * @param {object} linkData - { title: string, url: string, icon?: string, category?: string }
 * @returns {object} The created quick link with id and timestamps
 */
export function addQuickLink(linkData) {
  const validation = validateQuickLink(linkData);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const links = readFromStorage();
  const duplicate = links.find(
    (l) => l.url === linkData.url && l.title === linkData.title
  );
  if (duplicate) {
    throw new Error('A quick link with the same title and URL already exists');
  }

  const now = new Date().toISOString();
  const newLink = {
    id: generateId(),
    title: linkData.title.trim(),
    url: linkData.url.trim(),
    icon: linkData.icon || 'link',
    category: linkData.category || 'resource',
    createdAt: now,
    updatedAt: now,
  };

  links.push(newLink);
  writeToStorage(links);
  return newLink;
}

/**
 * Update an existing quick link by ID
 * @param {string} id
 * @param {object} updates - Partial quick link fields to update
 * @returns {object} The updated quick link
 */
export function updateQuickLink(id, updates) {
  if (!id || typeof id !== 'string') {
    throw new Error('Valid link ID is required');
  }

  const links = readFromStorage();
  const index = links.findIndex((l) => l.id === id);
  if (index === -1) {
    throw new Error('Quick link not found');
  }

  const merged = { ...links[index] };

  if (updates.title !== undefined) {
    if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
      throw new Error('Title must be a non-empty string');
    }
    if (updates.title.trim().length > 200) {
      throw new Error('Title must be 200 characters or fewer');
    }
    merged.title = updates.title.trim();
  }

  if (updates.url !== undefined) {
    if (!isValidUrl(updates.url)) {
      throw new Error('URL must be a valid HTTPS URL');
    }
    merged.url = updates.url.trim();
  }

  if (updates.icon !== undefined) {
    merged.icon = updates.icon;
  }

  if (updates.category !== undefined) {
    merged.category = updates.category;
  }

  merged.updatedAt = new Date().toISOString();
  links[index] = merged;
  writeToStorage(links);
  return merged;
}

/**
 * Delete a quick link by ID
 * @param {string} id
 * @returns {boolean} True if deleted
 */
export function deleteQuickLink(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Valid link ID is required');
  }

  const links = readFromStorage();
  const index = links.findIndex((l) => l.id === id);
  if (index === -1) {
    throw new Error('Quick link not found');
  }

  links.splice(index, 1);
  writeToStorage(links);
  return true;
}

/**
 * Get only Confluence-category quick links
 * @returns {Array<object>}
 */
export function getConfluenceLinks() {
  const links = readFromStorage();
  return links.filter((l) => l.category === 'confluence');
}

/**
 * Get quick links filtered by category
 * @param {string} category
 * @returns {Array<object>}
 */
export function getQuickLinksByCategory(category) {
  const links = readFromStorage();
  if (!category) {
    return links;
  }
  return links.filter((l) => l.category === category);
}

/**
 * Reset quick links to defaults
 * @returns {Array<object>}
 */
export function resetQuickLinksToDefaults() {
  const defaults = [...DEFAULT_QUICK_LINKS];
  writeToStorage(defaults);
  return defaults;
}