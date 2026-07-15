const express = require('express');
const router = express.Router();
const { addReview } = require('../controllers/reviews.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

// Protect all review routes with authentication
router.use(authMiddleware);

// Add a new review
router.post('/', addReview);

module.exports = router;
