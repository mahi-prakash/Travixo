/**
 * @file Bounded Context: Itinerary Routes
 * Router binding for conversational travel planning and itinerary management endpoints.
 * Note: Keeps exact frontend URL integration by mounting to /api/messages.
 */

const express = require('express');
const router = express.Router();
const itineraryController = require('./itinerary.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { chatLimiter } = require('../../middlewares/rateLimit.middleware');

// Ensure authentication across itinerary planning routes
router.use(authMiddleware);

// Apply dedicated chat rate limiter to AI itinerary synthesis interactions
router.post('/', chatLimiter, (req, res, next) => itineraryController.handleChatMessage(req, res, next));
router.post('/save-only', (req, res, next) => itineraryController.saveOnlyMessage(req, res, next));
router.get('/:trip_id', (req, res, next) => itineraryController.getMessages(req, res, next));

module.exports = router;
