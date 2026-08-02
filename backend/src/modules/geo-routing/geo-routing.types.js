/**
 * @file Bounded Context: Geo-Routing Types & Constants
 * Encapsulates type structures and configuration values for geographic travel logistics.
 */

/**
 * @typedef {Array<number>} CoordinatePair
 * A tuple representing geographic coordinates as [longitude, latitude].
 */

/**
 * @typedef {Object} RouteLegResult
 * @property {string} distance - Calculated road distance formatted in kilometers (e.g. "12.5").
 * @property {number} duration - Calculated estimated driving duration rounded up in minutes.
 */

/**
 * Constants governing geographic routing integrations.
 */
const ROUTING_CONSTANTS = {
  OSRM_DRIVING_BASE_URL: 'http://router.project-osrm.org/route/v1/driving/',
  MIN_COORDINATES_REQUIRED: 2,
  SUCCESS_CODE: 'Ok',
};

/**
 * Validates whether the supplied coordinates match expected structural rules.
 * @param {any} coordinates 
 * @returns {boolean}
 */
const isValidCoordinatesArray = (coordinates) => {
  return (
    Array.isArray(coordinates) &&
    coordinates.length >= ROUTING_CONSTANTS.MIN_COORDINATES_REQUIRED &&
    coordinates.every(c => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number')
  );
};

module.exports = {
  ROUTING_CONSTANTS,
  isValidCoordinatesArray,
};
