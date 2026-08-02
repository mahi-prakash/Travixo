/**
 * @file Bounded Context: Reviews Controller
 * Presentation layer for processing HTTP review submissions and emitting responses.
 */

const reviewsService = require('./reviews.service');

class ReviewsController {
  /**
   * POST /
   * Handler for registering user ratings and place feedback.
   */
  async addReview(req, res, next) {
    try {
      const userId = req.user.id;
      const review = await reviewsService.createReview(userId, req.body);
      
      return res.status(201).json({
        message: 'Review added successfully',
        review
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({ error: error.message });
      }
      console.error('ADD_REVIEW_ERROR:', error);
      next(error);
    }
  }
}

module.exports = new ReviewsController();
