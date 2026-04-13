import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackBaseUrl = import.meta.env.PROD
    ? 'https://edumatric-new.onrender.com/api/datasedu'
    : '/api/datasedu';

/**
 * Shared axios instance for all API calls.
 * - withCredentials: true — keeps cookie transport working for local dev (same-origin via Vite proxy)
 * - Request interceptor injects Authorization: Bearer for production cross-origin (Vercel → Render).
 *   This is the primary auth mechanism in production because browsers block cross-site cookies.
 */
const api = axios.create({
    baseURL: (envBaseUrl || fallbackBaseUrl).replace(/\/+$/, ''),
    timeout: 20000, // 20s — Render free tier can take 10-15s on cold start
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor: inject JWT via Authorization header ─────────────────
// In production (Vercel → Render), the browser blocks cross-site cookies even
// with SameSite=None due to Chrome's 3rd-party cookie restrictions.
// We store the JWT in sessionStorage (cleared on tab close) and send it via
// the Authorization header so it always reaches Render, regardless of cookie policy.
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('edu_auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: suppress expected 401 noise ───────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        if (status === 401 && !url?.endsWith('/me')) {
            console.warn(`[API] 401 Unauthorized on ${url}`);
        }

        return Promise.reject(error);
    }
);

export default api;
