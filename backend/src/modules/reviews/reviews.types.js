/**
 * @file Bounded Context: Reviews Types & Validation
 * Defines domain structural rules, type definitions, and validation helpers for user feedback.
 */

/**
 * @typedef {Object} ReviewPayload
 * @property {string} place_id - Identifier of the travel landmark or attraction being reviewed.
 * @property {string} trip_id - Associated trip context ID.
 * @property {string} [place_name] - Human readable title of the place.
 * @property {string} [place_category] - Category descriptor (e.g. SIGHTSEEING, RESTAURANT).
 * @property {number} rating - Numeric score typically between 1 and 5.
 * @property {number} [facility_quality] - Optional rating for facility cleanliness or service.
 * @property {boolean} [budget_friendly] - Whether the place was cost effective.
 * @property {string} [personal_experience] - Highlights of user experience.
 * @property {string} [review_text] - Written commentary or review notes.
 */

const REVIEW_CONSTANTS = {
  REQUIRED_FIELDS: ['place_id', 'trip_id', 'rating'],
  TABLE_NAME: 'reviews',
};

/**
 * Validates whether the required fields are present in a review submission.
 * @param {Object} payload 
 * @returns {{ valid: boolean, missing: string[] }}
 */
const validateReviewInput = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, missing: REVIEW_CONSTANTS.REQUIRED_FIELDS };
  }
  const missing = REVIEW_CONSTANTS.REQUIRED_FIELDS.filter(field => payload[field] === undefined || payload[field] === null || payload[field] === '');
  return {
    valid: missing.length === 0,
    missing
  };
};

module.exports = {
  REVIEW_CONSTANTS,
  validateReviewInput,
};
