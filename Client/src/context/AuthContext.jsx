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

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True until session check completes
  const [error, setError] = useState(null);

  // ── On app load: restore session from JWT cookie via /me ─────────────────
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/me');
      setUser(data.user);
    } catch {
      setUser(null); // Cookie absent or expired — user is logged out
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/login', { email, password });
      setUser(data.user);
      navigate(ROLE_PATHS[data.user.role] || '/student');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password, confirmPassword, role = 'student') => {
    setError(null);
    try {
      const { data } = await api.post('/register', { name, email, password, confirmPassword, role });
      setUser(data.user);
      navigate(ROLE_PATHS[data.user.role] || '/student');
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.message ||
        'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
