import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackBaseUrl = import.meta.env.PROD
    ? 'https://edumatric-new.onrender.com/api/datasedu'
    : '/api/datasedu';

/**
 * Shared axios instance for all API calls.
 * - In development, baseURL points to /api so the Vite proxy forwards to :5000.
 * - In production, points directly to the Render API.
 * - withCredentials: true — required for the browser to send/receive HttpOnly JWT cookies
 *   on cross-origin requests (Vercel → Render). Without this, cookies are stripped.
 */
const api = axios.create({
    baseURL: (envBaseUrl || fallbackBaseUrl).replace(/\/+$/, ''),
    timeout: 20000, // 20s — Render free tier can take 10-15s on cold start
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor — handle 401 globally.
// We deliberately do NOT redirect here; that's AuthContext's responsibility.
// This interceptor only handles logging so we don't pollute the console with
// expected 401s from /me checks on unauthenticated visits.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        if (status === 401) {
            // /me returning 401 is expected when not logged in — suppress noise
            if (!url?.endsWith('/me')) {
                console.warn(`[API] 401 Unauthorized on ${url}`);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
