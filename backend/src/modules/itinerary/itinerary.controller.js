/**
 * @file Bounded Context: Itinerary Controller
 * Presentation layer responsible for handling itinerary creation and chat interactions.
 */

const itineraryService = require('./itinerary.service');
const itineraryRepository = require('./itinerary.repository');

class ItineraryController {
  /**
   * POST /
   * Processes conversational travel prompts and itinerary synthesis.
   */
  async handleChatMessage(req, res, next) {
    try {
      const responsePayload = await itineraryService.processChatMessage(req.body);
      return res.status(200).json(responsePayload);
    } catch (error) {
      console.error('CHAT_ERROR:', error);

      // Handle AI provider exhaustion graceful fallbacks
      if (error.message && error.message.includes('EXHAUSTED')) {
        return res.status(503).json({
          error: 'All AI providers are currently unavailable. Please try again in a few minutes.'
        });
      }

      next(error);
    }
  }

  /**
   * GET /:trip_id
   * Retrieves stored interactions for an itinerary.
   */
  async getMessages(req, res, next) {
    try {
      const { trip_id } = req.params;
      const messages = await itineraryRepository.getMessagesByTripId(trip_id);
      return res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /save-only
   * Persists chat checkpoints without executing AI synthesis.
   */
  async saveOnlyMessage(req, res, next) {
    try {
      const result = await itineraryRepository.saveMessage(req.body);
      return res.status(200).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ItineraryController();
