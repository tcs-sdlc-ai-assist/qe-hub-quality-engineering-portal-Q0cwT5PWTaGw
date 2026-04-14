import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const DEFAULT_COLORS = [
  '#6366f1', // brand-500
  '#14b8a6', // accent/teal
  '#f59e0b', // warning/amber
  '#ef4444', // danger/red
  '#22c55e', // success/green
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
]

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-full w-full animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="h-32 w-full max-w-xs bg-surface-200 rounded" />
        <div className="h-3 w-24 bg-surface-200 rounded" />
      </div>
    </div>
  )
}

function renderBarChart(data, dataKeys, colors, xAxisKey) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis
        dataKey={xAxisKey}
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={{ stroke: '#cbd5e1' }}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={{ stroke: '#cbd5e1' }}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '13px',
        }}
      />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
      {dataKeys.map((key, index) => (
        <Bar
          key={key}
          dataKey={key}
          fill={colors[index % colors.length]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  )
}

function renderStackedBarChart(data, dataKeys, colors, xAxisKey) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis
        dataKey={xAxisKey}
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={{ stroke: '#cbd5e1' }}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={{ stroke: '#cbd5e1' }}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '13px',
        }}
      />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
      {dataKeys.map((key, index) => (
        <Bar
          key={key}
          dataKey={key}
          stackId="stack"
          fill={colors[index % colors.length]}
          radius={index === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
        />
      ))}
    </BarChart>
  )
}

function renderLineChart(data, dataKeys, colors, xAxisKey) {
  return (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis
        dataKey={xAxisKey}
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={{ stroke: '#cbd5e1' }}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 12, fill: '#64748b' }}
        axisLine={{ stroke: '#cbd5e1' }}
        tickLine={false}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '13px',
        }}
      />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
      {dataKeys.map((key, index) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={colors[index % colors.length]}
          strokeWidth={2}
          dot={{ r: 3, fill: colors[index % colors.length] }}
          activeDot={{ r: 5 }}
        />
      ))}
    </LineChart>
  )
}

function renderPieChart(data, dataKeys, colors, nameKey) {
  const dataKey = dataKeys[0] || 'value'
  const resolvedNameKey = nameKey || 'name'
  return (
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={resolvedNameKey}
        cx="50%"
        cy="50%"
        outerRadius="75%"
        innerRadius="40%"
        paddingAngle={2}
        label={({ name, percent }) =>
          `${name} ${(percent * 100).toFixed(0)}%`
        }
        labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${entry[resolvedNameKey] || index}`}
            fill={colors[index % colors.length]}
          />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '13px',
        }}
      />
      <Legend wrapperStyle={{ fontSize: '12px' }} />
    </PieChart>
  )
}

export default function ChartCard({
  title,
  subtitle,
  chartType,
  data,
  dataKeys,
  xAxisKey,
  nameKey,
  colors,
  height,
  loading,
  showLegend,
  className,
}) {
  const [mounted, setMounted] = useState(false)
  const resolvedColors = colors || DEFAULT_COLORS

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderChart = () => {
    if (loading || !mounted) {
      return <LoadingSkeleton />
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-surface-400 text-sm font-sans">No data available</p>
        </div>
      )
    }

    switch (chartType) {
      case 'bar':
        return renderBarChart(data, dataKeys, resolvedColors, xAxisKey)
      case 'stackedBar':
        return renderStackedBarChart(data, dataKeys, resolvedColors, xAxisKey)
      case 'line':
        return renderLineChart(data, dataKeys, resolvedColors, xAxisKey)
      case 'pie':
        return renderPieChart(data, dataKeys, resolvedColors, nameKey)
      default:
        return renderBarChart(data, dataKeys, resolvedColors, xAxisKey)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-200 p-5 flex flex-col font-sans ${className || ''}`}
    >
      <div className="mb-4">
        {title && (
          <h3 className="text-base font-semibold text-surface-800 leading-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-surface-500 mt-0.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 min-h-0" style={{ height: height || 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

ChartCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  chartType: PropTypes.oneOf(['bar', 'line', 'pie', 'stackedBar']),
  data: PropTypes.arrayOf(PropTypes.object),
  dataKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  xAxisKey: PropTypes.string,
  nameKey: PropTypes.string,
  colors: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.number,
  loading: PropTypes.bool,
  showLegend: PropTypes.bool,
  className: PropTypes.string,
}

ChartCard.defaultProps = {
  title: '',
  subtitle: '',
  chartType: 'bar',
  data: [],
  xAxisKey: 'name',
  nameKey: 'name',
  colors: null,
  height: 300,
  loading: false,
  showLegend: true,
  className: '',
}