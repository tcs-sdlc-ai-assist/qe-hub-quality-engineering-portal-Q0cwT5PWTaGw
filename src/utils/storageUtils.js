/**
 * localStorage abstraction layer with JSON serialization,
 * fallback values, mock data seeding, and size utilities.
 */

const STORAGE_INITIALIZED_KEY = '__qe_hub_initialized__'

/**
 * Retrieves a value from localStorage, parsing it as JSON.
 * Returns the fallback if the key does not exist or parsing fails.
 * @param {string} key - The localStorage key
 * @param {*} [fallback=null] - Value to return if key is missing or parse fails
 * @returns {*} The parsed value or fallback
 */
export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return fallback
    }
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * Stores a value in localStorage after JSON-stringifying it.
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store (will be JSON.stringify'd)
 * @returns {boolean} True if the write succeeded, false otherwise
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes a key from localStorage.
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} True if the removal succeeded, false otherwise
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Seeds mock/default data into localStorage on first run.
 * Subsequent calls are no-ops unless storage has been cleared.
 * @param {Record<string, *>} [seedData={}] - Map of key→value pairs to seed
 * @returns {boolean} True if seeding was performed, false if already initialized
 */
export function initializeStorage(seedData = {}) {
  try {
    const alreadyInitialized = localStorage.getItem(STORAGE_INITIALIZED_KEY)
    if (alreadyInitialized) {
      return false
    }

    const defaultSeed = {
      qe_hub_role: import.meta.env.VITE_DEFAULT_ROLE || 'engineer',
      qe_hub_theme: 'light',
      qe_hub_sidebar_collapsed: false,
      qe_hub_quick_links: [],
      qe_hub_recent_searches: [],
      qe_hub_dashboard_layout: {
        widgets: ['metrics', 'recent-activity', 'quick-links'],
        columns: 2,
      },
    }

    const mergedSeed = { ...defaultSeed, ...seedData }

    const keys = Object.keys(mergedSeed)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      setItem(key, mergedSeed[key])
    }

    localStorage.setItem(STORAGE_INITIALIZED_KEY, JSON.stringify(true))
    return true
  } catch {
    return false
  }
}

/**
 * Clears all qe-hub related data from localStorage,
 * including the initialization flag so that initializeStorage
 * will re-seed on next call.
 * @returns {boolean} True if clear succeeded, false otherwise
 */
export function clearStorage() {
  try {
    localStorage.clear()
    return true
  } catch {
    return false
  }
}

/**
 * Calculates the approximate size of all data currently stored
 * in localStorage, in bytes.
 * @returns {{ bytes: number, kilobytes: number, megabytes: number, itemCount: number }}
 */
export function getStorageSize() {
  try {
    let totalBytes = 0
    const itemCount = localStorage.length

    for (let i = 0; i < itemCount; i++) {
      const key = localStorage.key(i)
      if (key !== null) {
        const value = localStorage.getItem(key) || ''
        // Each character in JS is 2 bytes (UTF-16), but localStorage
        // implementations typically count characters, so we use
        // character length as a practical byte approximation.
        totalBytes += key.length + value.length
      }
    }

    // Multiply by 2 for UTF-16 encoding
    const bytes = totalBytes * 2
    const kilobytes = parseFloat((bytes / 1024).toFixed(2))
    const megabytes = parseFloat((bytes / (1024 * 1024)).toFixed(4))

    return { bytes, kilobytes, megabytes, itemCount }
  } catch {
    return { bytes: 0, kilobytes: 0, megabytes: 0, itemCount: 0 }
  }
}