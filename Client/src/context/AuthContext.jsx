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
// Two separate keys in sessionStorage:
//
// 1. edu_auth_token  — The raw JWT, injected as Authorization: Bearer on every
//    API request via the axios request interceptor. This is the PRIMARY auth
//    mechanism in production (Vercel → Render) because browsers block cross-site
//    HttpOnly cookies (Chrome 3rd-party cookie restrictions).
//
// 2. edu_session_user — A non-sensitive user snapshot { _id, name, email, role }
//    used ONLY to prevent the flash-redirect-to-login on page refresh while
//    checkAuth() is verifying in the background. Never used for API auth.
//
// Both are in sessionStorage (not localStorage) so they're cleared when the
// browser tab is closed. This limits the XSS exposure window.
const TOKEN_KEY = 'edu_auth_token';
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

const setStoredToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
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

  const updateUser = useCallback((u, token) => {
    // IMPORTANT: Write token to sessionStorage SYNCHRONOUSLY first,
    // before any React state update. React setState is async — if we
    // wrote the token inside the state setter, the axios interceptor
    // could fire (via DataContext's useEffect) before sessionStorage
    // has the token, causing 401s on the first batch of API calls.
    if (token !== undefined) {
      setStoredToken(token); // synchronous sessionStorage write
    }
    setUser(u);
    setCachedUser(u);
  }, []);

  // ── On app load: verify session against the server via /me ───────────────
  // This is the authoritative check. The sessionStorage cache is only a
  // UX optimization to prevent the flash-to-login on cold-start.
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/me');
      // /me doesn't return a new token — we just confirm the existing session is valid
      updateUser(data.user, undefined);
    } catch (err) {
      if (err.response?.status === 401) {
        // Confirmed 401 = token expired/missing — clear everything
        updateUser(null, null);
      }
      // Network errors / 5xx: keep the cached session; Render may be cold-starting
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
      updateUser(data.user, data.token); // store both user snapshot and JWT
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
      updateUser(data.user, data.token); // store both user snapshot and JWT
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
      updateUser(null, null); // clears both user cache and stored JWT token
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
