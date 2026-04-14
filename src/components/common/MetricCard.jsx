import PropTypes from 'prop-types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const trendConfig = {
  up: {
    icon: TrendingUp,
    colorClass: 'text-success-600',
    bgClass: 'bg-success-50',
    label: 'Trending up',
  },
  down: {
    icon: TrendingDown,
    colorClass: 'text-danger-600',
    bgClass: 'bg-danger-50',
    label: 'Trending down',
  },
  neutral: {
    icon: Minus,
    colorClass: 'text-surface-500',
    bgClass: 'bg-surface-100',
    label: 'No change',
  },
}

export default function MetricCard({ label, value, trend, trendValue, icon: Icon }) {
  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo ? trendInfo.icon : null

  return (
    <div className="rounded-xl bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-500 truncate">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-surface-900 font-sans">
            {value}
          </p>
          {trendInfo && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trendInfo.bgClass} ${trendInfo.colorClass}`}
              >
                <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {trendValue != null && <span>{trendValue}</span>}
              </span>
              <span className="sr-only">{trendInfo.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4 flex-shrink-0 rounded-lg bg-brand-50 p-2.5 text-brand-600">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  icon: PropTypes.elementType,
}

MetricCard.defaultProps = {
  trend: null,
  trendValue: null,
  icon: null,
}