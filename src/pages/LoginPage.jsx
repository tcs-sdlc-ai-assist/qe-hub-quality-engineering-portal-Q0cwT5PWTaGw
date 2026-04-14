import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LogIn, Shield, Mail, ChevronDown } from 'lucide-react';
import { ROLES } from '../constants/constants';
import { setItem } from '../utils/storageUtils';

const ROLE_OPTIONS = [
  { value: 'engineer', label: 'View-Only (Engineer)', badge: 'surface' },
  { value: 'lead', label: 'Test Lead', badge: 'brand' },
  { value: 'manager', label: 'Admin (Manager)', badge: 'success' },
];

const ROLE_BADGE_COLORS = {
  surface: 'bg-surface-100 text-surface-700',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-success-50 text-success-700',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('qe.user@company.com');
  const [selectedRole, setSelectedRole] = useState('engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      try {
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 600));

        setItem('auth_user', JSON.stringify({
          email,
          role: selectedRole,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          authenticated: true,
          loginTime: new Date().toISOString(),
        }));

        setItem('user_role', selectedRole);

        navigate(from, { replace: true });
      } catch (err) {
        setError(err.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, selectedRole, navigate, from]
  );

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-card mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900">QE Hub</h1>
          <p className="text-surface-500 mt-2">Quality Engineering Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-8">
          <h2 className="text-xl font-semibold text-surface-900 mb-1">Sign In</h2>
          <p className="text-sm text-surface-500 mb-6">
            Enter your credentials to access the dashboard.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-600 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-lg text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors shadow-soft"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-surface-700 mb-1.5">
                Role
              </label>
              <div className="relative">
                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-surface-300 rounded-lg text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors shadow-soft appearance-none bg-white"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
              </div>
              {selectedRoleOption && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      ROLE_BADGE_COLORS[selectedRoleOption.badge]
                    }`}
                  >
                    {selectedRoleOption.label}
                  </span>
                  <span className="text-xs text-surface-400">
                    {selectedRole === 'engineer' && '— Read-only access to dashboards'}
                    {selectedRole === 'lead' && '— Can edit fields and manage data'}
                    {selectedRole === 'manager' && '— Full admin access'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-soft"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-200">
            <p className="text-xs text-surface-400 text-center">
              This is a mock authentication page for development purposes.
              <br />
              Select any role and click Sign In to proceed.
            </p>
          </div>
        </div>

        <p className="text-xs text-surface-400 text-center mt-6">
          QE Hub v1.0 — Quality Engineering Dashboard
        </p>
      </div>
    </div>
  );
}