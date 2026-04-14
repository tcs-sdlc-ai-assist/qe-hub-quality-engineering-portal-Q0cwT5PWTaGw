import React from 'react'
import PropTypes from 'prop-types'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught rendering error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[300px] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-card text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-50">
              <AlertTriangle className="h-7 w-7 text-danger-600" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-surface-900">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-surface-500">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>
            {this.state.errorInfo?.componentStack && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-xs font-medium text-surface-400 hover:text-surface-600 transition-colors">
                  View error details
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-surface-50 p-3 text-xs text-surface-600 font-mono">
                  {this.state.error?.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
}

ErrorBoundary.defaultProps = {
  fallback: null,
}

export default ErrorBoundary