/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Role-to-dashboard mapping — centralized here so Login and Register don't
 * hard-code paths separately.
 */
const ROLE_PATHS = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

// ── Session cache helpers ────────────────────────────────────────────────────
// We cache a minimal, non-sensitive user snapshot in sessionStorage.
// This is NOT a security token — it is only used to avoid the flash-redirect
// to /login that happens during checkAuth() on page refresh.
// HttpOnly cookies still control actual API authorization on the server.
const SESSION_KEY = 'edu_session_user';

const getCachedUser = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedUser = (user) => {
  try {
    if (user) {
      // Only cache non-sensitive fields — never the JWT itself
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch { /* ignore quota errors */ }
};
// ─────────────────────────────────────────────────────────────────────────────

const getAuthErrorMessage = (err, fallback) => {
  if (err.response?.status === 503) {
    return err.response?.data?.message || 'Server database is unavailable. Check the backend deployment.';
  }

  return (
    err.response?.data?.errors?.join(', ') ||
    err.response?.data?.message ||
    fallback
  );
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Pre-populate from sessionStorage so ProtectedRoute doesn't redirect on refresh
  // while checkAuth() is still in-flight against the Render backend.
  const [user, setUser] = useState(getCachedUser);

  // loading: true only while the server-side cookie check is pending.
  // If we have a cached user, auth starts as "verifying" (not blind loading).
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateUser = useCallback((u) => {
    setUser(u);
    setCachedUser(u);
  }, []);

  // ── On app load: verify session against the server via /me ───────────────
  // This is the authoritative check. The sessionStorage cache is only a
  // UX optimization to prevent the flash-to-login on cold-start.
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/me');
      updateUser(data.user); // null means no valid cookie → clears cache
    } catch (err) {
      // Network errors (e.g., Render cold-start timeout) should NOT log out
      // the user if we already have a cached session. Only a confirmed 401
      // from the server means the token is gone/expired.
      if (err.response?.status === 401) {
        updateUser(null);
      }
      // For network errors / 5xx, keep the cached user so they aren't
      // kicked to login when the backend is simply waking up.
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/login', { email, password });
      updateUser(data.user);
      navigate(ROLE_PATHS[data.user.role] || '/student');
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Login failed');
      setError(message);
      return { success: false, message };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password, confirmPassword, role = 'student') => {
    setError(null);
    try {
      const { data } = await api.post('/register', { name, email, password, confirmPassword, role });
      updateUser(data.user);
      navigate(ROLE_PATHS[data.user.role] || '/student');
      return { success: true };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Registration failed');
      setError(message);
      return { success: false, message };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      updateUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
