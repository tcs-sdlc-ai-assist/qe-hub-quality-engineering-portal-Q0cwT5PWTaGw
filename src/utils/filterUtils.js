/**
 * Generic filtering and sorting utilities for dashboard tables and lists.
 * Pure JS — no JSX, no React dependencies.
 */

/**
 * Normalizes a string value for comparison: lowercase, trimmed, whitespace/hyphens/underscores collapsed to underscore.
 * @param {*} value - The value to normalize
 * @returns {string} Normalized string
 */
function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  return String(value).toLowerCase().trim().replace(/[\s\-]+/g, '_');
}

/**
 * Checks whether a single data item matches a single filter criterion.
 * Supports string, number, array (multi-select), and wildcard ('all', '', undefined) values.
 *
 * @param {*} itemValue - The value from the data item's field
 * @param {*} filterValue - The filter value to match against
 * @returns {boolean} True if the item matches the filter
 */
export function matchesFilter(itemValue, filterValue) {
  // Wildcard / empty filter — matches everything
  if (
    filterValue === undefined ||
    filterValue === null ||
    filterValue === '' ||
    filterValue === 'all'
  ) {
    return true;
  }

  // Multi-select: filterValue is an array
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true;
    const normalizedOptions = filterValue.map(normalizeValue);
    return normalizedOptions.includes(normalizeValue(itemValue));
  }

  // Scalar comparison
  return normalizeValue(itemValue) === normalizeValue(filterValue);
}

/**
 * Applies multiple filters to a data array. Each key in the filters object
 * corresponds to a field name on the data items.
 *
 * @param {Array<Object>} data - The array of data objects to filter
 * @param {Object} filters - An object where keys are field names and values are the filter criteria
 * @returns {Array<Object>} Filtered array (new array, does not mutate input)
 */
export function applyFilters(data, filters) {
  if (!Array.isArray(data)) return [];
  if (!filters || typeof filters !== 'object') return [...data];

  const filterEntries = Object.entries(filters);

  return data.filter((item) =>
    filterEntries.every(([field, filterValue]) =>
      matchesFilter(item[field], filterValue)
    )
  );
}

/**
 * Extracts unique values from an array of objects for a given field.
 * Useful for building filter dropdown options.
 *
 * @param {Array<Object>} data - The data array
 * @param {string} field - The field/key to extract unique values from
 * @returns {Array<string>} Sorted array of unique non-null string values
 */
export function getUniqueValues(data, field) {
  if (!Array.isArray(data) || !field) return [];

  const seen = new Set();
  data.forEach((item) => {
    const val = item[field];
    if (val !== null && val !== undefined && val !== '') {
      seen.add(String(val));
    }
  });

  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

/**
 * Builds filter dropdown options from a data array for a given field.
 * Returns an array of { label, value } objects suitable for FilterDropdown / FilterBar.
 * Optionally prepends an "All" option.
 *
 * @param {Array<Object>} data - The data array
 * @param {string} field - The field to extract options from
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.includeAll=true] - Whether to prepend an "All" option
 * @param {string} [options.allLabel='All'] - Label for the "All" option
 * @param {Function} [options.labelFormatter] - Optional function to format the label: (value) => string
 * @returns {Array<{label: string, value: string}>} Array of option objects
 */
export function buildFilterOptions(data, field, options = {}) {
  const {
    includeAll = true,
    allLabel = 'All',
    labelFormatter,
  } = options;

  const uniqueValues = getUniqueValues(data, field);

  const result = uniqueValues.map((val) => ({
    label: typeof labelFormatter === 'function' ? labelFormatter(val) : val,
    value: val,
  }));

  if (includeAll) {
    result.unshift({ label: allLabel, value: 'all' });
  }

  return result;
}

/**
 * Sorts an array of objects by a given field. Returns a new array (immutable).
 * Null/undefined values are always pushed to the end regardless of sort direction.
 *
 * @param {Array<Object>} data - The data array to sort
 * @param {string} sortField - The field/key to sort by
 * @param {'asc'|'desc'} [sortDirection='asc'] - Sort direction
 * @returns {Array<Object>} New sorted array
 */
export function sortData(data, sortField, sortDirection = 'asc') {
  if (!Array.isArray(data) || !sortField) return data ? [...data] : [];

  const direction = sortDirection === 'desc' ? -1 : 1;

  return [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    // Nulls always last
    const aNull = aVal === null || aVal === undefined;
    const bNull = bVal === null || bVal === undefined;

    if (aNull && bNull) return 0;
    if (aNull) return 1;
    if (bNull) return -1;

    // Numeric comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction;
    }

    // Date comparison (ISO date strings)
    const aDate = Date.parse(aVal);
    const bDate = Date.parse(bVal);
    if (!isNaN(aDate) && !isNaN(bDate) && typeof aVal === 'string' && typeof bVal === 'string') {
      return (aDate - bDate) * direction;
    }

    // String comparison (case-insensitive)
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return -1 * direction;
    if (aStr > bStr) return 1 * direction;
    return 0;
  });
}