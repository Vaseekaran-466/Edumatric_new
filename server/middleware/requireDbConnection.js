import { isDbConnected } from '../config/db.js';

const requireDbConnection = (req, res, next) => {
    if (isDbConnected()) {
        return next();
    }

    return res.status(503).json({
        message: 'Database unavailable. Please try again shortly.',
        code: 'DB_UNAVAILABLE',
    });
};

export default requireDbConnection;
