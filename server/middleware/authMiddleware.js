import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT stored in an HttpOnly cookie.
 * @param {Object} options - Configuration options
 * @param {boolean} options.isOptional - If true, proceeds even if no token is found (req.user will be undefined)
 * Rejects unauthenticated requests before they reach controllers.
 * Never trusts Authorization headers — always reads from secure cookies.
 */
const authMiddleware = (options = { isOptional: false }) => (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        if (options.isOptional) {
            return next(); // Proceed without user — controller handles null user
        }
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
            return res.status(500).json({ message: 'Internal Server Configuration Error' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log('DEBUG: Decoded JWT:', decoded);
        req.user = decoded; // Attach decoded payload { id, email, role } to request
        next();
    } catch (error) {
        // Differentiate between expired and invalid tokens for better client handling
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export default authMiddleware;
