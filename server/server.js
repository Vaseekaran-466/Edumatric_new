import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './Routes/routes.js';
import dbconnect from './config/db.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// Trust the reverse proxy (Render/Vercel) so that "secure: true" cookies are correctly sent
app.set('trust proxy', 1);

// ─── CORS ────────────────────────────────────────────────────────────────────
const normalizeOrigin = (value) => {
    if (!value) return null;

    const origin = value.trim().replace(/\/+$/, '');
    if (!origin) return null;
    if (origin.startsWith('http://') || origin.startsWith('https://')) return origin;
    if (origin.startsWith('localhost') || origin.startsWith('127.0.0.1')) return `http://${origin}`;

    return `https://${origin}`;
};

const allowedOrigins = new Set(
    (process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean)
);

const isAllowedVercelOrigin = (origin) => /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeOrigin(origin);

        if (allowedOrigins.has(normalizedOrigin) || isAllowedVercelOrigin(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${[...allowedOrigins].join(', ')}`);
            const error = new Error('Not allowed by CORS');
            error.status = 403;
            callback(error);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses cookies — required for reading the JWT token

// ─── Database ─────────────────────────────────────────────────────────────────
dbconnect();

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/datasedu', routes);

app.get('/api/datasedu/test-cookie', (req, res) => {
    res.cookie('test', 'working', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60
    });
    res.json({ message: 'Cookie set attempt made' });
});

// ─── Diagnostics (Temporary for debugging 500 errors) ────────────────────────
app.get('/api/datasedu/diag', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        res.status(200).json({
            status: 'Diagnostic Report',
            database: {
                state: states[dbState] || 'unknown',
                connected: dbState === 1,
                host: mongoose.connection.host || 'none'
            },
            env: {
                has_mongo_url: !!process.env.MONGO_URL,
                has_jwt_secret: !!process.env.JWT_SECRET,
                client_url: process.env.CLIENT_URL,
                node_env: process.env.NODE_ENV
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any unhandled errors thrown by route handlers
app.use((err, req, res, next) => {
    console.error('SERVER_ERROR_HANDLED:', {
        message: err.message,
        status: err.status,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? 'Contact Support' : err.toString()
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running → http://localhost:${PORT}`);
    console.log(`📋 API base       → http://localhost:${PORT}/api/datasedu`);
});
