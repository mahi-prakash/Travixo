/**
 * @file Bounded Context: Itinerary Types & Constants
 * Defines domain data signatures, regex rules, and structural enums for travel plans.
 */

/**
 * @typedef {Object} ActivityItem
 * @property {string} id - Unique identifier for the scheduled activity.
 * @property {string} name - Primary display title of the place or activity.
 * @property {string} time - Scheduled time (e.g., "10:00 AM").
 * @property {string} type - Categorical type tag (e.g., SIGHTSEEING, FOOD).
 * @property {string} desc - Descriptive rationale for the recommended visit.
 * @property {string} [location] - Official address or landmark reference.
 * @property {Array<number>} [coords] - Geographic GPS tuple [latitude, longitude].
 */

/**
 * @typedef {Object} ItineraryDay
 * @property {number} day - Day sequence integer.
 * @property {string} id - Identifier matching day index (e.g. "day-1").
 * @property {Array<ActivityItem>} items - Activities planned for the day.
 */

const ITINERARY_CONSTANTS = {
  ACTIVITY_TYPES: ['SIGHTSEEING', 'FOOD', 'HOTEL', 'ACTIVITY', 'TRANSPORT', 'FLIGHT'],
  MAX_HISTORY_MESSAGES: 5,
  MAX_MESSAGE_TOKEN_LENGTH: 1000,
  MODIFICATION_REGEX: /(add|remove|delete|change|replace|modify|swap|update)\b.*\b(day|itinerary|plan|trip|lunch|dinner|breakfast|hotel|flight|restaurant|cafe|place|activity|item)/i,
  GENERIC_MEAL_REGEX: /^(local\s*(restaurant|café|cafe|market|eatery)|beachside\s*(restaurant|cafe)|hotel\s*([a-z]+)?$|cozy\s*hotel|breakfast\s*at|lunch\s*at|dinner\s*at)/i,
};

module.exports = {
  ITINERARY_CONSTANTS,
};
