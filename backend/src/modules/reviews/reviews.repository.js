/**
 * @file Bounded Context: Reviews Repository (Data Access Layer)
 * Isolates table operations and Supabase query logic away from controllers and services.
 */

const supabase = require('../../config/supabase');
const { REVIEW_CONSTANTS } = require('./reviews.types');

class ReviewsRepository {
  /**
   * Inserts a newly authored review record into persistent storage.
   * @param {Object} reviewData - The compiled review entity containing user and rating info.
   * @returns {Promise<Object>} The persisted record returned from the database.
   */
  async insertReview(reviewData) {
    const { data, error } = await supabase
      .from(REVIEW_CONSTANTS.TABLE_NAME)
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

module.exports = new ReviewsRepository();
