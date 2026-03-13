/**
 * Middleware to restrict access based on user roles.
 * Must be used AFTER authMiddleware as it relies on req.user.
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'teacher')
 */
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User context missing' });
        }

        if (!roles.includes(req.user.role)) {
            console.log(`DEBUG: Role check failed. User role: ${req.user.role}, Allowed: ${roles}`);
            return res.status(403).json({
                message: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

export default roleMiddleware;
