import dbconnect, { isDbConnected } from '../config/db.js';

const requireDbConnection = (req, res, next) => {
    if (isDbConnected()) {
        return next();
    }

    // Trigger a background reconnect attempt for transient outages without
    // blocking the request path.
    void dbconnect().catch(() => {});

    return res.status(503).json({
        message: 'Database unavailable. Please try again shortly.',
        code: 'DB_UNAVAILABLE',
    });
};

export default requireDbConnection;
