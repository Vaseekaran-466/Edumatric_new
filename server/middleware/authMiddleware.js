import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT — accepts token from two transports:
 *
 * 1. Authorization: Bearer <token>   — used in production (Vercel → Render cross-origin).
 *    Browsers increasingly block cross-site cookies (Chrome 3rd-party cookie restrictions),
 *    so for cross-origin deployments we send the token via the Authorization header instead.
 *
 * 2. HttpOnly cookie "token"          — used in local dev (same origin via Vite proxy),
 *    or as a future fallback for same-domain deployments.
 *
 * @param {Object} options
 * @param {boolean} options.isOptional - If true, proceeds even if no token is found.
 */
const authMiddleware = (options = { isOptional: false }) => (req, res, next) => {
    // ── 1. Try Authorization header (cross-origin production) ──────────────────
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    }

    // ── 2. Fall back to HttpOnly cookie (local dev / same-origin) ─────────────
    if (!token) {
        token = req.cookies?.token;
    }

    if (!token) {
        if (options.isOptional) {
            return next();
        }
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal Server Configuration Error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach { id, email, role } to request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export default authMiddleware;
