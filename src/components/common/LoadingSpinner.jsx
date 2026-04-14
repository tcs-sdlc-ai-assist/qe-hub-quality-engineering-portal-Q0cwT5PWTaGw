import PropTypes from 'prop-types'

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const spinnerSize = sizeClasses[size] || sizeClasses.md
  const textSize = textSizeClasses[size] || textSizeClasses.md

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div
        className={`${spinnerSize} rounded-full border-surface-300 border-t-brand-600 animate-spin`}
        role="status"
        aria-label={text}
      />
      {text && (
        <p className={`mt-4 ${textSize} font-medium text-surface-500`}>
          {text}
        </p>
      )}
    </div>
  )
}

LoadingSpinner.propTypes = {
  text: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}