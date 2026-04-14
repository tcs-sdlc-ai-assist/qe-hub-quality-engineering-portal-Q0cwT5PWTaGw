/**
 * Recharts configuration and data transformation utilities.
 * Pure JS — no JSX. All functions are named exports.
 */

/**
 * Default chart color palette matching brand tokens.
 * @type {string[]}
 */
const DEFAULT_PALETTE = [
  '#6366f1', // brand-500 (indigo)
  '#14b8a6', // accent (teal)
  '#f59e0b', // amber/warning
  '#ef4444', // red/danger
  '#22c55e', // green/success
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#64748b', // slate
];

/**
 * Shared tooltip content style used across all chart types.
 * @type {object}
 */
const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
};

/**
 * Shared axis tick style.
 * @type {object}
 */
const AXIS_TICK_STYLE = {
  fontSize: 12,
  fill: '#64748b', // surface-500 / slate-500
};

/**
 * Shared cartesian grid config.
 * @type {object}
 */
const GRID_CONFIG = {
  strokeDasharray: '3 3',
  vertical: false,
  stroke: '#e2e8f0', // surface-200 / slate-200
};

/**
 * Returns an array of chart colors, optionally overridden by a custom palette.
 * @param {string[]} [customColors] - Optional custom color array
 * @param {number} [count] - Number of colors needed
 * @returns {string[]} Array of hex color strings
 */
export function getChartColors(customColors, count) {
  const palette = customColors && customColors.length > 0 ? customColors : DEFAULT_PALETTE;
  if (typeof count === 'number' && count > 0) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(palette[i % palette.length]);
    }
    return result;
  }
  return [...palette];
}

/**
 * Builds configuration object for a standard bar chart.
 * @param {object} options
 * @param {Array<object>} options.data - Chart data array
 * @param {string} options.xKey - Key for x-axis category
 * @param {string|string[]} options.yKeys - Key(s) for y-axis values
 * @param {string[]} [options.colors] - Custom color palette
 * @param {boolean} [options.showGrid=true] - Show cartesian grid
 * @param {boolean} [options.showTooltip=true] - Show tooltip
 * @param {boolean} [options.showLegend=false] - Show legend
 * @param {number} [options.barRadius=4] - Bar border radius
 * @returns {object} Bar chart configuration
 */
export function buildBarChartConfig(options) {
  const {
    data = [],
    xKey = 'name',
    yKeys = ['value'],
    colors,
    showGrid = true,
    showTooltip = true,
    showLegend = false,
    barRadius = 4,
  } = options || {};

  const keys = Array.isArray(yKeys) ? yKeys : [yKeys];
  const chartColors = getChartColors(colors, keys.length);

  return {
    data,
    xKey,
    bars: keys.map((key, index) => ({
      dataKey: key,
      fill: chartColors[index],
      radius: [barRadius, barRadius, 0, 0],
    })),
    grid: showGrid ? GRID_CONFIG : null,
    tooltip: showTooltip ? { contentStyle: TOOLTIP_STYLE } : null,
    showLegend,
    xAxis: {
      dataKey: xKey,
      tick: AXIS_TICK_STYLE,
      axisLine: { stroke: '#e2e8f0' },
      tickLine: false,
    },
    yAxis: {
      tick: AXIS_TICK_STYLE,
      axisLine: false,
      tickLine: false,
    },
  };
}

/**
 * Builds configuration object for a stacked bar chart.
 * @param {object} options
 * @param {Array<object>} options.data - Chart data array
 * @param {string} options.xKey - Key for x-axis category
 * @param {string[]} options.stackKeys - Keys for each stack segment
 * @param {string[]} [options.colors] - Custom color palette
 * @param {boolean} [options.showGrid=true] - Show cartesian grid
 * @param {boolean} [options.showTooltip=true] - Show tooltip
 * @param {boolean} [options.showLegend=true] - Show legend
 * @param {number} [options.barRadius=4] - Bar border radius
 * @returns {object} Stacked bar chart configuration
 */
export function buildStackedBarConfig(options) {
  const {
    data = [],
    xKey = 'name',
    stackKeys = [],
    colors,
    showGrid = true,
    showTooltip = true,
    showLegend = true,
    barRadius = 4,
  } = options || {};

  const chartColors = getChartColors(colors, stackKeys.length);

  return {
    data,
    xKey,
    bars: stackKeys.map((key, index) => ({
      dataKey: key,
      fill: chartColors[index],
      stackId: 'stack',
      radius: index === stackKeys.length - 1 ? [barRadius, barRadius, 0, 0] : [0, 0, 0, 0],
    })),
    grid: showGrid ? GRID_CONFIG : null,
    tooltip: showTooltip ? { contentStyle: TOOLTIP_STYLE } : null,
    showLegend,
    xAxis: {
      dataKey: xKey,
      tick: AXIS_TICK_STYLE,
      axisLine: { stroke: '#e2e8f0' },
      tickLine: false,
    },
    yAxis: {
      tick: AXIS_TICK_STYLE,
      axisLine: false,
      tickLine: false,
    },
  };
}

/**
 * Builds configuration object for a line chart.
 * @param {object} options
 * @param {Array<object>} options.data - Chart data array
 * @param {string} options.xKey - Key for x-axis category
 * @param {string|string[]} options.yKeys - Key(s) for y-axis line values
 * @param {string[]} [options.colors] - Custom color palette
 * @param {boolean} [options.showGrid=true] - Show cartesian grid
 * @param {boolean} [options.showTooltip=true] - Show tooltip
 * @param {boolean} [options.showLegend=false] - Show legend
 * @param {boolean} [options.showDots=true] - Show data point dots
 * @param {number} [options.strokeWidth=2] - Line stroke width
 * @param {string} [options.curveType='monotone'] - Line curve type
 * @returns {object} Line chart configuration
 */
export function buildLineChartConfig(options) {
  const {
    data = [],
    xKey = 'name',
    yKeys = ['value'],
    colors,
    showGrid = true,
    showTooltip = true,
    showLegend = false,
    showDots = true,
    strokeWidth = 2,
    curveType = 'monotone',
  } = options || {};

  const keys = Array.isArray(yKeys) ? yKeys : [yKeys];
  const chartColors = getChartColors(colors, keys.length);

  return {
    data,
    xKey,
    lines: keys.map((key, index) => ({
      dataKey: key,
      stroke: chartColors[index],
      strokeWidth,
      type: curveType,
      dot: showDots ? { r: 4, fill: chartColors[index] } : false,
      activeDot: showDots ? { r: 6, fill: chartColors[index] } : false,
    })),
    grid: showGrid ? GRID_CONFIG : null,
    tooltip: showTooltip ? { contentStyle: TOOLTIP_STYLE } : null,
    showLegend,
    xAxis: {
      dataKey: xKey,
      tick: AXIS_TICK_STYLE,
      axisLine: { stroke: '#e2e8f0' },
      tickLine: false,
    },
    yAxis: {
      tick: AXIS_TICK_STYLE,
      axisLine: false,
      tickLine: false,
    },
  };
}

/**
 * Builds configuration object for a pie chart.
 * @param {object} options
 * @param {Array<object>} options.data - Chart data array with name and value keys
 * @param {string} [options.dataKey='value'] - Key for pie segment values
 * @param {string} [options.nameKey='name'] - Key for pie segment labels
 * @param {string[]} [options.colors] - Custom color palette
 * @param {boolean} [options.showTooltip=true] - Show tooltip
 * @param {boolean} [options.showLegend=true] - Show legend
 * @param {number} [options.innerRadius=0] - Inner radius (0 for pie, >0 for donut)
 * @param {number} [options.outerRadius=80] - Outer radius
 * @param {boolean} [options.showLabels=false] - Show labels on segments
 * @param {number} [options.paddingAngle=2] - Padding angle between segments
 * @returns {object} Pie chart configuration
 */
export function buildPieChartConfig(options) {
  const {
    data = [],
    dataKey = 'value',
    nameKey = 'name',
    colors,
    showTooltip = true,
    showLegend = true,
    innerRadius = 0,
    outerRadius = 80,
    showLabels = false,
    paddingAngle = 2,
  } = options || {};

  const chartColors = getChartColors(colors, data.length);

  return {
    data,
    dataKey,
    nameKey,
    slices: data.map((_, index) => ({
      fill: chartColors[index % chartColors.length],
    })),
    colors: chartColors,
    innerRadius,
    outerRadius,
    paddingAngle,
    showLabels,
    tooltip: showTooltip ? { contentStyle: TOOLTIP_STYLE } : null,
    showLegend,
  };
}

/**
 * Formats a tooltip value for display.
 * @param {number|string} value - The raw value
 * @param {string} [type='number'] - Format type: 'number', 'percentage', 'currency'
 * @param {number} [decimals=0] - Decimal places
 * @returns {string} Formatted value string
 */
export function formatChartTooltip(value, type, decimals) {
  if (value === null || value === undefined) {
    return '—';
  }

  const formatType = type || 'number';
  const decimalPlaces = typeof decimals === 'number' ? decimals : 0;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '—';
  }

  switch (formatType) {
    case 'percentage':
      return numValue.toFixed(decimalPlaces) + '%';
    case 'currency':
      return '$' + numValue.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
    case 'number':
    default:
      return numValue.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
  }
}

/**
 * Builds trend data from a flat array by grouping on a period key.
 * When no groupKey is provided, aggregates valueKey per period.
 * When groupKey is provided, each unique group value becomes a separate key in the output.
 *
 * @param {object} options
 * @param {Array<object>} options.data - Source data array
 * @param {string} options.periodKey - Key to group by for x-axis (e.g., 'month', 'week', 'date')
 * @param {string} options.valueKey - Key for the numeric value to aggregate
 * @param {string} [options.groupKey] - Optional key to split into multiple series
 * @param {string} [options.aggregation='sum'] - Aggregation method: 'sum', 'count', 'avg'
 * @returns {Array<object>} Array of objects with 'period' key and value keys
 */
export function buildTrendData(options) {
  const {
    data = [],
    periodKey = 'period',
    valueKey = 'value',
    groupKey,
    aggregation = 'sum',
  } = options || {};

  if (!data || data.length === 0) {
    return [];
  }

  const periodMap = new Map();

  data.forEach((item) => {
    const period = item[periodKey];
    if (period === null || period === undefined) return;

    if (!periodMap.has(period)) {
      periodMap.set(period, { period, _counts: {} });
    }

    const entry = periodMap.get(period);

    if (groupKey) {
      const group = item[groupKey];
      if (group === null || group === undefined) return;

      const val = typeof item[valueKey] === 'number' ? item[valueKey] : 1;

      if (entry[group] === undefined) {
        entry[group] = 0;
        entry._counts[group] = 0;
      }

      if (aggregation === 'count') {
        entry[group] += 1;
      } else {
        entry[group] += val;
      }
      entry._counts[group] += 1;
    } else {
      const val = typeof item[valueKey] === 'number' ? item[valueKey] : 1;

      if (entry[valueKey] === undefined) {
        entry[valueKey] = 0;
        entry._counts[valueKey] = 0;
      }

      if (aggregation === 'count') {
        entry[valueKey] += 1;
      } else {
        entry[valueKey] += val;
      }
      entry._counts[valueKey] += 1;
    }
  });

  const result = [];

  periodMap.forEach((entry) => {
    const output = { period: entry.period };

    if (aggregation === 'avg') {
      Object.keys(entry).forEach((key) => {
        if (key === 'period' || key === '_counts') return;
        const count = entry._counts[key] || 1;
        output[key] = entry[key] / count;
      });
    } else {
      Object.keys(entry).forEach((key) => {
        if (key === 'period' || key === '_counts') return;
        output[key] = entry[key];
      });
    }

    result.push(output);
  });

  return result;
}

/**
 * Severity color mapping for chart usage.
 * @type {object}
 */
export const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

/**
 * RAG status color mapping for chart usage.
 * @type {object}
 */
export const RAG_COLORS = {
  Red: '#ef4444',
  RED: '#ef4444',
  Amber: '#f59e0b',
  AMBER: '#f59e0b',
  Green: '#22c55e',
  GREEN: '#22c55e',
};

/**
 * Returns the default chart palette.
 * @returns {string[]}
 */
export function getDefaultPalette() {
  return [...DEFAULT_PALETTE];
}

/**
 * Returns the shared tooltip content style.
 * @returns {object}
 */
export function getTooltipStyle() {
  return { ...TOOLTIP_STYLE };
}

/**
 * Returns the shared cartesian grid configuration.
 * @returns {object}
 */
export function getGridConfig() {
  return { ...GRID_CONFIG };
}

/**
 * Returns the shared axis tick style.
 * @returns {object}
 */
export function getAxisTickStyle() {
  return { ...AXIS_TICK_STYLE };
}