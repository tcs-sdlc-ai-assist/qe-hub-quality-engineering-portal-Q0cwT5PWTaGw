import { useState, useCallback, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  ClipboardCheck,
  BarChart3,
  Upload,
  Settings,
  Link as LinkIcon,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Activity,
} from 'lucide-react';
import ErrorBoundary from '../common/ErrorBoundary';
import { NAV_ITEMS, APP_NAME } from '../../constants/constants';

const ICON_MAP = {
  LayoutDashboard,
  FolderKanban,
  Bug,
  ClipboardCheck,
  BarChart3,
  Upload,
  Settings,
  Link: LinkIcon,
  Menu,
  Shield,
  Activity,
};

function resolveIcon(iconKey) {
  return ICON_MAP[iconKey] || LayoutDashboard;
}

function SidebarNavItem({ item, collapsed, onClick }) {
  const IconComponent = resolveIcon(item.icon);

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
          collapsed ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-brand-50 text-brand-600'
            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
        }`
      }
      title={collapsed ? item.label : undefined}
    >
      <IconComponent className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

SidebarNavItem.propTypes = {
  item: PropTypes.shape({
    path: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  collapsed: PropTypes.bool,
  onClick: PropTypes.func,
};

SidebarNavItem.defaultProps = {
  collapsed: false,
  onClick: undefined,
};

function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const location = useLocation();

  useEffect(() => {
    if (mobileOpen) {
      onCloseMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white border-r border-surface-200 flex flex-col transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
        aria-label="Main navigation"
      >
        {/* Sidebar header */}
        <div
          className={`flex items-center h-16 border-b border-surface-200 px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900 truncate">
                {APP_NAME}
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              onClick={mobileOpen ? onCloseMobile : undefined}
            />
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center border-t border-surface-200 p-3">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  onCloseMobile: PropTypes.func.isRequired,
};

function Header({ onMenuClick }) {
  const currentRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

  const roleLabels = {
    engineer: 'Engineer',
    lead: 'Test Lead',
    manager: 'Manager',
  };

  const roleBadgeColors = {
    engineer: 'bg-surface-100 text-surface-700',
    lead: 'bg-brand-50 text-brand-700',
    manager: 'bg-success-50 text-success-700',
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-6 shadow-soft">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-surface-900">
            {APP_NAME}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            roleBadgeColors[currentRole] || roleBadgeColors.engineer
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {roleLabels[currentRole] || 'Engineer'}
        </span>
      </div>
    </header>
  );
}

Header.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleOpenMobile = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={handleCloseMobile}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={handleOpenMobile} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}