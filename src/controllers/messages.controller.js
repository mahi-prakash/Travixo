const logger = require('../utils/logger');
const { generateAiResponse } = require('../services/ai.service.js');
const { getTravelPlannerPrompt } = require('../config/prompts.js');

/**
 * Controller to handle AI chat messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const { content, destination = 'Unknown', history = [] } = req.body;

    // 1. Get the system prompt from config
    const systemPrompt = getTravelPlannerPrompt(destination);

    // 2. Prepare message history for the AI
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        // Omit heavy itinerary data from history to save tokens
        content: (msg.content || "").replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, ' (Itinerary data omitted) ')
      })),
      { role: 'user', content }
    ];

    // 3. Call the AI Service
    const aiReply = await generateAiResponse(chatMessages);

    // 4. Send response
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error('CHAT_ERROR:', error);
    
    // Handle specific provider exhaustion errors
    if (error.message.includes('EXHAUSTED')) {
      return res.status(503).json({ 
        error: 'All AI providers are currently unavailable. Please try again in a few minutes.' 
      });
    }
    
    next(error);
  }
};

const getMessages = async (req, res) => res.status(200).json({ messages: [] });
const saveOnlyMessage = async (req, res) => res.status(200).json({ message: 'No-op in MVP' });

module.exports = {
  sendMessage,
  getMessages,
  saveOnlyMessage
};
