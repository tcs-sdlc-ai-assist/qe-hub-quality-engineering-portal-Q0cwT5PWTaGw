import { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Bug,
  Shield,
  Settings,
  Users,
  FileText,
  Upload,
  Link,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  TestTube2,
  GitBranch,
  Target,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Database,
  Layers,
} from 'lucide-react';
import { NAV_ITEMS, ROLES } from '../../constants/constants';

const ICON_MAP = {
  LayoutDashboard,
  Activity,
  BarChart3,
  Bug,
  Shield,
  Settings,
  Users,
  FileText,
  Upload,
  Link,
  TestTube2,
  GitBranch,
  Target,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Database,
  Layers,
};

const ROLE_HIERARCHY = {
  engineer: 1,
  lead: 2,
  manager: 3,
};

const SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    collapsible: false,
    items: ['dashboard'],
  },
  {
    id: 'execution',
    label: 'Execution Dashboard',
    collapsible: true,
    items: ['release-readiness', 'defect-dashboard', 'test-execution', 'environment-status'],
  },
  {
    id: 'quality',
    label: 'Quality Metrics',
    collapsible: true,
    items: ['quality-metrics', 'trend-analysis', 'sla-tracking'],
  },
  {
    id: 'admin',
    label: 'Admin',
    collapsible: true,
    minRole: 'lead',
    items: ['upload', 'settings', 'audit-log', 'quick-links'],
  },
];

/**
 * Resolves a lucide-react icon component from a string key
 * @param {string} iconKey - The icon name string from NAV_ITEMS
 * @returns {React.ComponentType|null} The icon component or null
 */
function resolveIcon(iconKey) {
  if (!iconKey) return null;
  return ICON_MAP[iconKey] || null;
}

/**
 * Checks if a user role meets the minimum role requirement
 * @param {string} userRole - Current user role
 * @param {string} minRole - Minimum required role
 * @returns {boolean}
 */
function hasRoleAccess(userRole, minRole) {
  if (!minRole) return true;
  const userLevel = ROLE_HIERARCHY[userRole] || 1;
  const minLevel = ROLE_HIERARCHY[minRole] || 1;
  return userLevel >= minLevel;
}

function NavItem({ item, isActive, isCollapsed, onClick }) {
  const IconComponent = resolveIcon(item.icon);

  return (
    <button
      onClick={() => onClick(item.path)}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150 group
        ${isActive
          ? 'bg-brand-50 text-brand-600'
          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
        }
      `}
      title={isCollapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {IconComponent && (
        <IconComponent
          size={18}
          className={`flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'}`}
        />
      )}
      {!isCollapsed && (
        <span className="truncate">{item.label}</span>
      )}
    </button>
  );
}

NavItem.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

function SectionHeader({ label, isOpen, isCollapsed, onToggle }) {
  if (isCollapsed) return null;

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-surface-400 hover:text-surface-600 transition-colors"
      aria-expanded={isOpen}
    >
      <span>{label}</span>
      {isOpen ? (
        <ChevronDown size={14} className="text-surface-400" />
      ) : (
        <ChevronRight size={14} className="text-surface-400" />
      )}
    </button>
  );
}

SectionHeader.propTypes = {
  label: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

/**
 * Build a lookup of nav items keyed by a simplified key derived from path
 * @param {Array} navItems - NAV_ITEMS from constants
 * @returns {Object} Map of key -> nav item
 */
function buildNavItemMap(navItems) {
  const map = {};
  if (!navItems || !Array.isArray(navItems)) return map;
  navItems.forEach((item) => {
    const key = item.path ? item.path.replace(/^\//, '').replace(/\//g, '-') || 'dashboard' : '';
    map[key] = { ...item, key };
  });
  return map;
}

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

  const [openSections, setOpenSections] = useState({
    execution: true,
    quality: true,
    admin: true,
  });

  const navItemMap = useMemo(() => buildNavItemMap(NAV_ITEMS), []);

  const handleToggleSection = useCallback((sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  const isActive = useCallback(
    (path) => {
      if (path === '/' || path === '/dashboard') {
        return location.pathname === '/' || location.pathname === '/dashboard';
      }
      return location.pathname === path || location.pathname.startsWith(path + '/');
    },
    [location.pathname]
  );

  /**
   * Resolve section items to actual nav item objects
   * @param {string[]} itemKeys
   * @returns {Array}
   */
  const resolveSectionItems = useCallback(
    (itemKeys) => {
      return itemKeys
        .map((key) => navItemMap[key])
        .filter(Boolean);
    },
    [navItemMap]
  );

  return (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-surface-200
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-4 border-b border-surface-200`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-surface-900 tracking-tight">QE Hub</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {SECTIONS.map((section) => {
          if (section.minRole && !hasRoleAccess(userRole, section.minRole)) {
            return null;
          }

          const items = resolveSectionItems(section.items);
          if (items.length === 0) return null;

          const sectionIsOpen = openSections[section.id] !== false;

          if (!section.collapsible) {
            return (
              <div key={section.id} className="mb-2">
                {items.map((item) => (
                  <NavItem
                    key={item.key}
                    item={item}
                    isActive={isActive(item.path)}
                    isCollapsed={collapsed}
                    onClick={handleNavigate}
                  />
                ))}
              </div>
            );
          }

          return (
            <div key={section.id} className="mb-2">
              <SectionHeader
                label={section.label}
                isOpen={sectionIsOpen}
                isCollapsed={collapsed}
                onToggle={() => handleToggleSection(section.id)}
              />
              {(sectionIsOpen || collapsed) && (
                <div className={`space-y-0.5 ${collapsed ? '' : 'ml-1'}`}>
                  {items.map((item) => (
                    <NavItem
                      key={item.key}
                      item={item}
                      isActive={isActive(item.path)}
                      isCollapsed={collapsed}
                      onClick={handleNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-3 border-t border-surface-200">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-600">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-700 truncate capitalize">
                {userRole}
              </p>
              <p className="text-xs text-surface-400">
                {userRole === 'manager' ? 'Admin' : userRole === 'lead' ? 'Test Lead' : 'Engineer'}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

Sidebar.defaultProps = {
  collapsed: false,
  onToggleCollapse: () => {},
};