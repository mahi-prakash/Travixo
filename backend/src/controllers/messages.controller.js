const logger = require('../utils/logger');
const { getTravelPlannerPrompt } = require('../config/prompts.js');
const { fetchFullDestinationContext } = require('../services/rag.service.js');
const { generateAiResponse } = require('../services/ai.service.js');
const { verifyPlacesWithGoogle } = require('../services/places.service.js');
const { clusterPlacesIntoDays } = require('../services/clustering.service.js');

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
            title: item.title,
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
        // Omit heavy data from history to save tokens and truncate content
        content: (msg.content || "").replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, ' (Data omitted) ').substring(0, 1000)
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
    let aiReply = await generateAiResponse(chatMessages);

    // 4. Extract [ITINERARY] and verify activities against Google Maps Ground Truth
    const itineraryMatch = aiReply.match(/\[ITINERARY\]([\s\S]*?)\[\/ITINERARY\]/i);
    if (itineraryMatch) {
      try {
        const itineraryJson = JSON.parse(itineraryMatch[1]);
        const rawDays = itineraryJson.days || {};
        const isArray = Array.isArray(rawDays);
        const dayEntries = isArray ? rawDays.map((d, i) => [i, d]) : Object.entries(rawDays);

        const verifiedDayEntries = await Promise.all(
          dayEntries.map(async ([key, day]) => {
            const rawItems = day.items || day.activities || [];
            // Run Google verification for all places scheduled on this day
            const verifiedItems = await verifyPlacesWithGoogle(rawItems, destination);

            // Merge AI's smart schedule with Google's verified coords and location (defaulting to raw item if unverified)
            const finalItems = rawItems.map((original, index) => {
              const verified = verifiedItems[index] || original;
              const titleOrName = verified.title || verified.name || original.title || original.name || "Scheduled Activity";
              return {
                ...original,
                ...verified,
                id: verified.id || original.id || `item-${key}-${index}-${Date.now()}`,
                name: titleOrName,
                title: titleOrName,
                time: original.time || verified.time || "10:00 AM",
                desc: original.desc || verified.desc || "Recommended experience",
                type: original.type || verified.type || "SIGHTSEEING",
                location: verified.location || original.location || original.desc || destination,
                estimated_cost: original.estimated_cost || verified.estimated_cost || "₹500",
                suggested_duration: original.suggested_duration || verified.suggested_duration || "1.5h",
                img: '' // Force Unsplash photo fetch on frontend
              };
            });

            return [
              key,
              {
                ...day,
                items: finalItems,
                activities: finalItems
              }
            ];
          })
        );

        const finalDays = isArray
          ? verifiedDayEntries.map(e => e[1])
          : Object.fromEntries(verifiedDayEntries);

        // 5. Programmatic Safeguard: Filter out generic meal placeholders (Option B) & deduplicate sights across days
        const seenLocations = new Set();
        const genericRegex = /^(local\s*(restaurant|café|cafe|market|eatery)|beachside\s*(restaurant|cafe)|hotel\s*([a-z]+)?$|cozy\s*hotel|breakfast\s*at|lunch\s*at|dinner\s*at)/i;

        const cleanDaysList = (isArray ? Object.values(finalDays) : Object.entries(finalDays)).map(entry => {
          const key = isArray ? null : entry[0];
          const dayObj = isArray ? entry : entry[1];
          const rawList = dayObj.items || dayObj.activities || [];

          const cleanedItems = rawList.filter(item => {
            const name = (item.name || item.title || "").trim();
            // Allow transport hubs for arrival/departure, but check attractions and meals
            if (item.type !== "TRANSPORT" && item.type !== "FLIGHT") {
              if (genericRegex.test(name)) return false;
              // Deduplication check using normalized canonical signature
              const simplified = name.toLowerCase().replace(/^(the|shree|a|an)\s+/i, '').replace(/\s+(beach|caves|temple|monument|resort|hotel|park|gardens)$/i, '').trim();
              if (seenLocations.has(simplified) && simplified.length > 3) return false;
              if (simplified.length > 3) seenLocations.add(simplified);
            }
            return true;
          });

          return isArray ? { ...dayObj, items: cleanedItems, activities: cleanedItems } : [key, { ...dayObj, items: cleanedItems, activities: cleanedItems }];
        });

        const ultraCleanDays = isArray ? cleanDaysList : Object.fromEntries(cleanDaysList);

        const verifiedItinerary = {
          ...itineraryJson,
          destination: destination,
          days: ultraCleanDays
        };

        // Replace the unverified itinerary with our Google-grounded version
        aiReply = aiReply.replace(
          /\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/i,
          `[ITINERARY]\n${JSON.stringify(verifiedItinerary, null, 2)}\n[/ITINERARY]`
        );

      } catch (err) {
        console.error("Error processing and verifying itinerary:", err);
        // Fall back to original AI reply if parsing fails
      }
    }

    // 5. Send response
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
