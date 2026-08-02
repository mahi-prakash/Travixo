/**
 * @file Bounded Context: Reviews Business Service Layer
 * Coordinates validation rules and entity construction for user reviews.
 */

const reviewsRepository = require('./reviews.repository');
const { validateReviewInput } = require('./reviews.types');

class ReviewsService {
  /**
   * Validates and registers a new travel review from an authenticated user.
   * @param {string} userId - ID of the authenticated user creating the review.
   * @param {Object} payload - Raw body attributes submitted from client.
   * @returns {Promise<Object>} Created review entity.
   */
  async createReview(userId, payload) {
    const validation = validateReviewInput(payload);
    if (!validation.valid) {
      const error = new Error(`Missing required fields: ${validation.missing.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const {
      place_id,
      trip_id,
      place_name,
      place_category,
      rating,
      facility_quality,
      budget_friendly,
      personal_experience,
      review_text
    } = payload;

    const reviewEntity = {
      user_id: userId,
      place_id,
      trip_id,
      place_name,
      place_category,
      rating,
      facility_quality,
      budget_friendly,
      personal_experience,
      review_text
    };

    const persistedReview = await reviewsRepository.insertReview(reviewEntity);
    return persistedReview;
  }
}

module.exports = new ReviewsService();
