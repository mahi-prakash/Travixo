/**
 * @file Bounded Context: Itinerary Service Layer
 * Orchestrates prompt formulation, RAG context enrichment, AI execution, and location ground-truth verification.
 */

const logger = require('../../utils/logger');
const { getTravelPlannerPrompt } = require('./services/prompts');
const { fetchFullDestinationContext } = require('./services/rag.service');
const { generateAiResponse } = require('./services/ai.service');
const { verifyPlacesWithGoogle } = require('./services/places.service');
const { ITINERARY_CONSTANTS } = require('./itinerary.types');

class ItineraryService {
  /**
   * Processes a travel planning interaction, coordinates RAG grounding, invokes AI providers, and verifies attractions against Google Maps.
   * @param {Object} payload 
   * @returns {Promise<{ reply: string }>}
   */
  async processChatMessage(payload) {
    const {
      tripId,
      content = "",
      destination,
      history = [],
      origin,
      arrivalStation,
      hotelAddress,
      allowModification,
      currentItinerary
    } = payload;

    // 🚀 ZERO-TOKEN FAST-PATH: Intercept modification requests in the backend before burning AI budget
    if (content.match(ITINERARY_CONSTANTS.MODIFICATION_REGEX) && !content.toLowerCase().startsWith("plan a ")) {
      return {
        reply: `I cannot modify the itinerary directly from this chat. Please switch to your **[Planner](/planner/${tripId})** where you can easily drag-and-drop, add new places, or click the Trash icon to delete items manually!`
      };
    }

    // 1. Initialize system instructions from config
    let systemPrompt = getTravelPlannerPrompt(destination);

    // 2. [RAG PIPELINE] Fetch real-world context (Wikipedia, Weather, Reddit, Distance, Ground-Truth Pool)
    const destinationContext = await fetchFullDestinationContext(destination, origin, arrivalStation, hotelAddress);
    if (destinationContext) {
      systemPrompt += `\n\n[CRITICAL RAG CONTEXT - DO NOT HALLUCINATE]\nHere is the factual summary and live data for ${destination}. Use this context to inform your itinerary:\n${destinationContext}`;
    }

    // 3. [DYNAMIC UI STATE RULE] Apply modification boundaries based on interactive toggle state
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

    // 4. Trim dialogue history to last N interactions to prevent Payload Too Large errors and excessive latency
    const recentHistory = history.slice(-ITINERARY_CONSTANTS.MAX_HISTORY_MESSAGES);
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: (msg.content || "").replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, ' (Data omitted) ').substring(0, ITINERARY_CONSTANTS.MAX_MESSAGE_TOKEN_LENGTH)
      })),
      { role: 'user', content }
    ];

    // 5. Invoke AI generation pooling service
    let aiReply = await generateAiResponse(chatMessages);

    // 6. Extract [ITINERARY] block and verify scheduled attractions against Google Maps ground truth
    const itineraryMatch = aiReply.match(/\[ITINERARY\]([\s\S]*?)\[\/ITINERARY\]/i);
    if (itineraryMatch) {
      try {
        let cleanedJsonStr = itineraryMatch[1].replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();
        const firstBrace = cleanedJsonStr.indexOf('{');
        const lastBrace = cleanedJsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedJsonStr = cleanedJsonStr.slice(firstBrace, lastBrace + 1).replace(/,\s*([\]}])/g, '$1');
        }
        const itineraryJson = JSON.parse(cleanedJsonStr);
        const rawDays = itineraryJson.days || {};
        const isArray = Array.isArray(rawDays);
        const dayEntries = isArray ? rawDays.map((d, i) => [i, d]) : Object.entries(rawDays);

        const verifiedDayEntries = await Promise.all(
          dayEntries.map(async ([key, day]) => {
            const rawItems = day.items || day.activities || [];
            // Verify places with Google Places API
            const verifiedItems = await verifyPlacesWithGoogle(rawItems, destination);

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
                img: '' // Force Unsplash photo enrichment on client
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

        // Programmatic Safeguard: Filter out generic meal placeholders and deduplicate attractions across days
        const seenLocations = new Set();
        const cleanDaysList = (isArray ? Object.values(finalDays) : Object.entries(finalDays)).map(entry => {
          const key = isArray ? null : entry[0];
          const dayObj = isArray ? entry : entry[1];
          const rawList = dayObj.items || dayObj.activities || [];

          const cleanedItems = rawList.filter(item => {
            const name = (item.name || item.title || "").trim();
            if (item.type !== "TRANSPORT" && item.type !== "FLIGHT") {
              if (ITINERARY_CONSTANTS.GENERIC_MEAL_REGEX.test(name)) return false;
              
              // Canonical normalized deduplication signature
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

        // Substitute unverified itinerary payload with Google-grounded JSON block
        aiReply = aiReply.replace(
          /\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/i,
          `[ITINERARY]\n${JSON.stringify(verifiedItinerary, null, 2)}\n[/ITINERARY]`
        );

      } catch (err) {
        logger.error(`Error processing and verifying itinerary JSON: ${err.message}`);
      }
    }

    return { reply: aiReply };
  }
}

module.exports = new ItineraryService();
