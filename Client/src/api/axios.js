import axios from 'axios';

/**
 * Shared axios instance for all API calls.
 * - baseURL points to /api so the Vite proxy handles forwarding to :5000 in dev.
 * - withCredentials: true is REQUIRED for the browser to send/receive HttpOnly JWT cookies.
 *   Without this, cookies will not be attached to cross-origin requests.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/datasedu',
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
