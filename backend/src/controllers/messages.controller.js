const logger = require('../utils/logger');
const { generateAiResponse } = require('../services/ai.service.js');
const { fetchFullDestinationContext } = require('../services/rag.service.js');
const { getTravelPlannerPrompt } = require('../config/prompts.js');

/**
 * Controller to handle AI chat messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const { tripId, content, destination, history = [], origin, arrivalStation, hotelAddress, allowModification, currentItinerary } = req.body;

    // 1. Get the system prompt from config
    let systemPrompt = getTravelPlannerPrompt(destination);

    // 1.5 [RAG PIPELINE] Fetch real-world context (Wikipedia, Weather, Reddit, Distance)
    const destinationContext = await fetchFullDestinationContext(destination, origin, arrivalStation, hotelAddress);
    if (destinationContext) {
      systemPrompt += `\n\n[CRITICAL RAG CONTEXT - DO NOT HALLUCINATE]\nHere is the factual summary and live data for ${destination}. Use this context to inform your itinerary:\n${destinationContext}`;
    }

    // 1.6 [DYNAMIC UI STATE RULE] Handle modification permissions based on UI Toggle
    if (allowModification === true) {
      systemPrompt += `\n\n[USER TOGGLED 'YOUR PLAN' MODE]\nThe user is currently viewing their editable 'Your Plan' tab. However, this chat interface is currently READ-ONLY and CANNOT modify the itinerary directly. IF the user asks to modify, add, replace, remove, or delete anything from the itinerary, politely refuse and instruct them to manually switch to the 'Planner' tab (or 'Your Plan' view) where they can easily drag-and-drop, search for new places, or click the Trash icon to delete items themselves.`;
      
      if (currentItinerary) {
        // Minify the itinerary to save thousands of tokens (Skeleton Map for Read-Only Context)
        const skeletonMap = {};
        const days = Array.isArray(currentItinerary.days) ? currentItinerary.days : Object.values(currentItinerary.days || {});
        days.forEach((day, idx) => {
          const dayId = day.id || `day-${day.day || idx + 1}`;
          skeletonMap[dayId] = (day.activities || day.items || []).map(item => ({
            title: item.title || item.name,
            time: item.time
          }));
        });
        const itineraryString = JSON.stringify(skeletonMap);
        
        systemPrompt += `\n\n[CURRENT ITINERARY CONTEXT]\nHere is a mapped overview of the user's current itinerary by Day ID and Activity:\n${itineraryString}\n\nUse this context to answer questions about their trip, but REMEMBER: you cannot modify it.`;
      }
    } else {
      systemPrompt += `\n\n[USER VIEWING 'AI PLAN' MODE - NO MODIFICATIONS ALLOWED]\nThe user is currently viewing the Read-Only 'AI Plan' tab. IF they ask to modify, replace, or edit the itinerary, FIRMLY REFUSE. Tell them to switch the toggle to 'Your Plan' (located next to the tabs in the UI) to unlock editing features. DO NOT output a new [ITINERARY] block under any circumstances.`;
    }

    // 2. Prepare message history for the AI (limit to last 5 messages to prevent 413 Payload Too Large)
    const recentHistory = history.slice(-5);

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        // Omit heavy itinerary data from history to save tokens and truncate content
        content: (msg.content || "").replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, ' (Itinerary data omitted) ').substring(0, 1000)
      })),
      { role: 'user', content }
    ];

    // 🚀 ZERO-TOKEN FAST-PATH: Intercept modification requests in the backend
    const modificationRegex = /(add|remove|delete|change|replace|modify|swap|update)\b.*\b(day|itinerary|plan|trip|lunch|dinner|breakfast|hotel|flight|restaurant|cafe|place|activity|item)/i;
    
    // Only intercept if it's a follow-up modification (not the initial onboarding prompt starting with "Plan a ")
    if (content.match(modificationRegex) && !content.toLowerCase().startsWith("plan a ")) {
      return res.status(200).json({ 
        reply: `I cannot modify the itinerary directly from this chat. Please switch to your **[Planner](/planner/${tripId})** where you can easily drag-and-drop, add new places, or click the Trash icon to delete items manually!` 
      });
    }

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
