import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackBaseUrl = import.meta.env.PROD
    ? 'https://edumatric-new.onrender.com/api/datasedu'
    : '/api/datasedu';

/**
 * Shared axios instance for all API calls.
 * - In development, baseURL points to /api so the Vite proxy forwards to :5000.
 * - In production, default directly to the Render API to avoid relying on a Vercel rewrite
 *   for authenticated requests and cookies.
 * - withCredentials: true is REQUIRED for the browser to send/receive HttpOnly JWT cookies.
 *   Without this, cookies will not be attached to cross-origin requests.
 */
const api = axios.create({
    baseURL: (envBaseUrl || fallbackBaseUrl).replace(/\/+$/, ''),
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor — handle 401 globally (e.g., session expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or missing — this is expected for guest users on /me
            // No need to log a warning as AuthContext handles this silently.
        }
        return Promise.reject(error);
    }
);

export default api;
