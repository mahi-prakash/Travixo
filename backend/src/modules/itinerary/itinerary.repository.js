/**
 * @file Bounded Context: Itinerary Repository (Data Access Layer)
 * Isolates persistence and query operations for travel chats and generated itineraries.
 */

const supabase = require('../../config/supabase');

class ItineraryRepository {
  /**
   * Retrieves message history for a given trip itinerary.
   * @param {string} tripId 
   * @returns {Promise<Array>}
   */
  async getMessagesByTripId(tripId) {
    // Current MVP behavior returns empty array until DB persistence is enabled for chat logs
    return [];
  }

  /**
   * Persists a chat message associated with an itinerary.
   * @param {Object} messagePayload 
   * @returns {Promise<Object>}
   */
  async saveMessage(messagePayload) {
    // Current MVP behavior acts as a no-op hook for message logging
    return { status: 'acknowledged', message: 'No-op in MVP' };
  }
}

module.exports = new ItineraryRepository();
