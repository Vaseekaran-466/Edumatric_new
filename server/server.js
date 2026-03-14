import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './Routes/routes.js';
import dbconnect from './config/db.js';

dotenv.config();

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(o => o.trim());
// Ensure all origins have a protocol; default to https for production URLs if missing
const allowedOrigins = origins.map(o => (o.startsWith('http') ? o : `https://${o}`));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
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

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any unhandled errors thrown by route handlers
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    if (err.stack) console.error(err.stack); // Print full stack trace
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: err.toString() // Also send back some info for easier debugging
    });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running → http://localhost:${PORT}`);
    console.log(`📋 API base       → http://localhost:${PORT}/api/datasedu`);
});