// Environment configuration initialized
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const { Server } = require('socket.io');

// Domain Bounded Context Routes
const itineraryRoutes = require('./modules/itinerary/itinerary.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const geoRoutingRoutes = require('./modules/geo-routing/geo-routing.routes');

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
app.use(globalLimiter); //it's work is to stop the spamming or DDOS attacks on the server so keep it on if u r not doing heavy local testing
// ─── ROUTES ──────────────────────────────────────────────────────────────────

app.use('/api/messages', itineraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/logistics', geoRoutingRoutes);

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
    logger.info(`Server v${VERSION} started on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on("join_trip", (tripId) => {
        socket.join(tripId);
        logger.info(`Socket ${socket.id} joined trip: ${tripId}`);
    });

    socket.on("send_message", (data) => {
        io.to(data.tripId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

