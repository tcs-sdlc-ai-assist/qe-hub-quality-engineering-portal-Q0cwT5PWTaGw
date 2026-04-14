import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { ShieldAlert } from 'lucide-react'

const DEFAULT_ROLE = import.meta.env.VITE_DEFAULT_ROLE || 'engineer'

const ROLE_HIERARCHY = {
  engineer: 1,
  lead: 2,
  manager: 3,
}

function getRoleLevel(role) {
  return ROLE_HIERARCHY[role] || 0
}

export default function ProtectedRoute({
  children,
  isAuthenticated = true,
  userRole = DEFAULT_ROLE,
  requiredRole = null,
  loginPath = '/login',
}) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (requiredRole && getRoleLevel(userRole) < getRoleLevel(requiredRole)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-50">
            <ShieldAlert className="h-8 w-8 text-danger-500" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-surface-900">
            Access Denied
          </h2>
          <p className="mb-6 text-sm text-surface-500">
            You do not have permission to access this page. This area requires{' '}
            <span className="font-medium text-surface-700">{requiredRole}</span>{' '}
            level access. Your current role is{' '}
            <span className="font-medium text-surface-700">{userRole}</span>.
          </p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool,
  userRole: PropTypes.oneOf(['engineer', 'lead', 'manager']),
  requiredRole: PropTypes.oneOf(['engineer', 'lead', 'manager']),
  loginPath: PropTypes.string,
}