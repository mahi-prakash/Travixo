require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');

// Routes
const messageRoutes = require('./routes/messages.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;
const VERSION = '1.1.0';

// Trust proxy is required for express-rate-limit on hosting like Render/Heroku
app.set('trust proxy', 1);

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

/**
 * GLOBAL RATE LIMITING
 * Comment out the line below during heavy local testing if needed.
 */
app.use(globalLimiter);

// ─── ROUTES ──────────────────────────────────────────────────────────────────

app.use('/api/messages', messageRoutes);

// Health Check / Root
app.get('/', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'Travstory AI Engine is humming along! 🚀',
        version: VERSION,
        timestamp: new Date().toISOString()
    });
});

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Middleware
app.use(errorMiddleware);

// ─── START SERVER ────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
    logger.info(`✅ Server v${VERSION} started on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated.');
    });
});
