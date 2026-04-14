import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
  User,
  Settings,
} from 'lucide-react';
import { ROLES } from '../../constants/constants';

const ROLE_OPTIONS = [
  { value: 'engineer', label: 'Engineer', role: ROLES.VIEW_ONLY },
  { value: 'lead', label: 'Test Lead', role: ROLES.TEST_LEAD },
  { value: 'manager', label: 'Manager', role: ROLES.ADMIN },
];

const ROLE_BADGE_STYLES = {
  engineer:
    'bg-surface-100 text-surface-700 border border-surface-300',
  lead: 'bg-brand-50 text-brand-700 border border-brand-200',
  manager:
    'bg-success-50 text-success-700 border border-success-200',
};

const ROLE_LABELS = {
  engineer: 'Engineer',
  lead: 'Test Lead',
  manager: 'Manager',
};

export default function Header({ onMenuToggle, isMobileMenuOpen }) {
  const currentRole =
    import.meta.env.VITE_DEFAULT_ROLE || 'engineer';
  const [activeRole, setActiveRole] = useState(currentRole);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const roleSwitcherRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (
      roleSwitcherRef.current &&
      !roleSwitcherRef.current.contains(event.target)
    ) {
      setIsRoleSwitcherOpen(false);
    }
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target)
    ) {
      setIsUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleKeyDown = useCallback((event, setter) => {
    if (event.key === 'Escape') {
      setter(false);
    }
  }, []);

  const handleRoleChange = useCallback((roleValue) => {
    setActiveRole(roleValue);
    setIsRoleSwitcherOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-surface-200 shadow-soft">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors lg:hidden"
            onClick={onMenuToggle}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-brand-600 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-surface-900 leading-tight font-sans">
                QE Hub
              </h1>
              <p className="text-xs text-surface-500 leading-none -mt-0.5">
                Quality Engineering
              </p>
            </div>
            <h1 className="text-lg font-bold text-surface-900 sm:hidden font-sans">
              QE Hub
            </h1>
          </div>
        </div>

        {/* Right section: Role switcher + User menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher */}
          <div
            ref={roleSwitcherRef}
            className="relative"
            onKeyDown={(e) => handleKeyDown(e, setIsRoleSwitcherOpen)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
              onClick={() => setIsRoleSwitcherOpen((prev) => !prev)}
              aria-expanded={isRoleSwitcherOpen}
              aria-haspopup="listbox"
              aria-label="Switch role"
            >
              <Settings className="h-4 w-4 text-surface-500" />
              <span
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${ROLE_BADGE_STYLES[activeRole] || ROLE_BADGE_STYLES.engineer}`}
              >
                {ROLE_LABELS[activeRole] || 'Engineer'}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-surface-400 transition-transform duration-200 ${isRoleSwitcherOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isRoleSwitcherOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-surface-200 py-1.5 animate-slide-down z-50"
                role="listbox"
                aria-label="Role options"
              >
                <div className="px-3 py-2 border-b border-surface-100">
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Switch Role (Prototype)
                  </p>
                </div>
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={activeRole === option.value}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                      activeRole === option.value
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-surface-700 hover:bg-surface-50'
                    }`}
                    onClick={() => handleRoleChange(option.value)}
                  >
                    <span
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-md text-xs font-bold ${
                        activeRole === option.value
                          ? 'bg-brand-100 text-brand-600'
                          : 'bg-surface-100 text-surface-500'
                      }`}
                    >
                      {option.label.charAt(0)}
                    </span>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-surface-500">
                        {option.value === 'engineer' && 'View-only access'}
                        {option.value === 'lead' && 'Edit & manage tests'}
                        {option.value === 'manager' && 'Full admin access'}
                      </p>
                    </div>
                    {activeRole === option.value && (
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-surface-200" />

          {/* User Menu */}
          <div
            ref={userMenuRef}
            className="relative"
            onKeyDown={(e) => handleKeyDown(e, setIsUserMenuOpen)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-100 text-brand-600">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-surface-900 leading-tight">
                  QE User
                </p>
                <p className="text-xs text-surface-500 leading-tight">
                  {ROLE_LABELS[activeRole] || 'Engineer'}
                </p>
              </div>
              <ChevronDown
                className={`hidden md:block h-3.5 w-3.5 text-surface-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-surface-200 py-1.5 animate-slide-down z-50">
                <div className="px-3 py-2.5 border-b border-surface-100">
                  <p className="text-sm font-semibold text-surface-900">
                    QE User
                  </p>
                  <p className="text-xs text-surface-500">
                    qe.user@company.com
                  </p>
                  <span
                    className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${ROLE_BADGE_STYLES[activeRole] || ROLE_BADGE_STYLES.engineer}`}
                  >
                    {ROLE_LABELS[activeRole] || 'Engineer'}
                  </span>
                </div>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  onMenuToggle: PropTypes.func,
  isMobileMenuOpen: PropTypes.bool,
};

Header.defaultProps = {
  onMenuToggle: () => {},
  isMobileMenuOpen: false,
};