import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './Routes/routes.js';
import dbconnect from './config/db.js';

dotenv.config();

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// credentials: true is required so the browser sends/receives HttpOnly cookies
// origin must be explicit (not '*') when credentials are enabled
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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