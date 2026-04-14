import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ROLES } from '../constants/constants';
import { getItem, setItem, removeItem } from '../utils/storageUtils';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'qe_hub_current_user';
const STORAGE_KEY_AUTH = 'qe_hub_is_authenticated';

const ROLE_HIERARCHY = {
  [ROLES.VIEW_ONLY]: 1,
  [ROLES.TEST_LEAD]: 2,
  [ROLES.ADMIN]: 3,
};

const DEFAULT_ROLE = import.meta.env.VITE_DEFAULT_ROLE || 'engineer';

const DEFAULT_USER = {
  name: 'QE User',
  email: 'qe.user@company.com',
  role: DEFAULT_ROLE,
};

/**
 * Retrieves the initial user from localStorage or returns the default user.
 * @returns {{ name: string, email: string, role: string }}
 */
function getInitialUser() {
  const stored = getItem(STORAGE_KEY_USER);
  if (stored && stored.name && stored.email && stored.role) {
    return stored;
  }
  return { ...DEFAULT_USER };
}

/**
 * Retrieves the initial authentication state from localStorage.
 * Defaults to true for development convenience.
 * @returns {boolean}
 */
function getInitialAuthState() {
  const stored = getItem(STORAGE_KEY_AUTH);
  if (stored === false) {
    return false;
  }
  return true;
}

/**
 * AuthProvider wraps the application and provides authentication state
 * including currentUser, login, logout, switchRole, and role-checking utilities.
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState);

  /**
   * Logs in a user with the given credentials.
   * For the prototype, accepts any name/email/role and sets authenticated state.
   * @param {{ name?: string, email?: string, role?: string }} userData
   */
  const login = useCallback((userData = {}) => {
    const user = {
      name: userData.name || DEFAULT_USER.name,
      email: userData.email || DEFAULT_USER.email,
      role: userData.role || DEFAULT_ROLE,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    setItem(STORAGE_KEY_USER, user);
    setItem(STORAGE_KEY_AUTH, true);
  }, []);

  /**
   * Logs out the current user and clears persisted auth state.
   */
  const logout = useCallback(() => {
    setCurrentUser({ ...DEFAULT_USER });
    setIsAuthenticated(false);
    removeItem(STORAGE_KEY_USER);
    setItem(STORAGE_KEY_AUTH, false);
  }, []);

  /**
   * Switches the current user's role (for demo/prototype purposes).
   * @param {string} newRole - One of 'engineer', 'lead', 'manager'
   */
  const switchRole = useCallback((newRole) => {
    const validRoles = [ROLES.VIEW_ONLY, ROLES.TEST_LEAD, ROLES.ADMIN];
    if (!validRoles.includes(newRole)) {
      return;
    }
    setCurrentUser((prev) => {
      const updated = { ...prev, role: newRole };
      setItem(STORAGE_KEY_USER, updated);
      return updated;
    });
  }, []);

  /**
   * Checks if the current user has at least the specified minimum role level.
   * @param {string} minRole - Minimum role required
   * @returns {boolean}
   */
  const hasMinRole = useCallback((minRole) => {
    const userLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    return userLevel >= requiredLevel;
  }, [currentUser.role]);

  /**
   * Checks if the current user is an admin (manager role).
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    return currentUser.role === ROLES.ADMIN;
  }, [currentUser.role]);

  /**
   * Checks if the current user can edit (lead or manager role).
   * @returns {boolean}
   */
  const canEdit = useCallback(() => {
    return currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.TEST_LEAD;
  }, [currentUser.role]);

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchRole,
    hasMinRole,
    isAdmin,
    canEdit,
  }), [currentUser, isAuthenticated, login, logout, switchRole, hasMinRole, isAdmin, canEdit]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider.
 * @returns {{ currentUser: { name: string, email: string, role: string }, isAuthenticated: boolean, login: Function, logout: Function, switchRole: Function, hasMinRole: Function, isAdmin: Function, canEdit: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;