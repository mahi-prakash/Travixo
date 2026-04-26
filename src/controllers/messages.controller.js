const Groq = require('groq-sdk');
const logger = require('../utils/logger');

// ─── Groq Load Balancer Setup ───────────────────────────────────────────────
const groqKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
  process.env.GROQ_API_KEY_6,
  process.env.GROQ_API_KEY_7,
  process.env.GROQ_API_KEY_8,
  process.env.GROQ_API_KEY_9,
].filter(key => key && !key.includes('YOUR_GROQ_KEY'));

const groqClients = groqKeys.map(key => new Groq({ apiKey: key }));
let currentClientIndex = 0;

const getNextGroqClient = () => {
  if (groqClients.length === 0) {
    throw new Error("No valid Groq API keys found in .env");
  }
  const client = groqClients[currentClientIndex];
  logger.info(`🔄 Using Groq Key #${currentClientIndex + 1} for this request`);
  currentClientIndex = (currentClientIndex + 1) % groqClients.length;
  return client;
};

const sendMessage = async (req, res, next) => {
  try {
    const { content, destination = 'Unknown', history = [] } = req.body;

    const systemPrompt = `
You are an ELITE Travel Planning Engine. 
Destination: ${destination}.

Rules:
1. Itinerary must be exactly for the requested trip length.
2. Day 1: Flight, Transport, Hotel Check-in. Last Day: Hotel Checkout, Return Travel.
3. Hotels: title, location, price_range (₹), booking_hint. Show ONLY on check-in day.
4. Transport: mode, route, cost (₹). 
5. Geography: Group by area, minimize travel time.
6. Allowed types: [SIGHTSEEING, FOOD, HOTEL, ACTIVITY, TRANSPORT, FLIGHT].
7. JSON: Strictly follow the format inside [ITINERARY] tags.
8. Nearby Places: Generate 3-5 recommended nearby places (cafes, attractions) in the "nearby_places" array. Include fake coordinates (lat, lng) close to the destination.

Format:
[ITINERARY]
{
  "destination": "${destination}",
  "days": [{
      "day": 1,
      "activities": [
        { "time": "10:00", "type": "FLIGHT", "title": "Arrival", "location": "Airport" },
        { "time": "13:00", "type": "HOTEL", "title": "Hotel", "location": "Area", "price_range": "₹5000", "booking_hint": "Nice view" }
      ]
  }],
  "nearby_places": [
    {
      "id": "ai-near-1",
      "name": "Local Cafe",
      "type": "food",
      "rating": 4.8,
      "aiMatchScore": 95,
      "coords": [48.8541, 2.3331],
      "category": "Food",
      "cost": "₹500",
      "duration": "1h",
      "bestTime": "Morning",
      "tags": ["Coffee", "Local"],
      "desc": "A great local spot."
    }
  ]
}
[/ITINERARY]

Response Rules:
1. If asked for a plan/itinerary: Friendly greeting, 2-4 lines of travel insights, brief "Trip Flow" reasoning, then the [ITINERARY] block.
2. If just chatting/asking questions: Talk normally and helpfully without the [ITINERARY] block.
3. Keep all responses concise to save tokens until asked not to(IMPORTANT)
`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content.replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, " (Itinerary data omitted) ")
      })),
      { role: "user", content }
    ];

    let aiReply = null;
    let attempts = 0;
    const maxAttempts = groqClients.length;

    while (attempts < maxAttempts) {
      try {
        const selectedGroq = getNextGroqClient();
        const response = await selectedGroq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: chatMessages,
          max_tokens: 3000,
          temperature: 0.2,
        });

        aiReply = response.choices[0].message.content;
        break; // Success! Exit the loop.
      } catch (err) {
        attempts++;
        logger.warn(`⚠️ Groq key failed (${err.message}). Retrying... (${attempts}/${maxAttempts})`);

        if (attempts >= maxAttempts) {
          throw new Error("All Groq API keys are restricted or exhausted. Please check your .env keys.");
        }
      }
    }

    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error('CHAT_ERROR:', error);
    next(error);
  }
};

const getMessages = async (req, res) => {
  res.status(200).json({ messages: [] });
};

const saveOnlyMessage = async (req, res) => {
  res.status(200).json({ message: 'No-op in MVP' });
};

module.exports = { sendMessage, getMessages, saveOnlyMessage };
