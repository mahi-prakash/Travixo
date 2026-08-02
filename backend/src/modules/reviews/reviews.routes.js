/**
 * @file Bounded Context: Reviews Routes
 * Router binding for rating and user feedback endpoints.
 */

const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Protect all review routes with authentication
router.use(authMiddleware);

// Add a new review
router.post('/', (req, res, next) => reviewsController.addReview(req, res, next));

module.exports = router;
