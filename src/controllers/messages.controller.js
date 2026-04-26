const Groq = require('groq-sdk');
const { Mistral } = require('@mistralai/mistralai');
const logger = require('../utils/logger');

// ─── Groq Pool ───────────────────────────────────────────────────────────────
const groqKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  process.env.GROQ_API_KEY_5,
  process.env.GROQ_API_KEY_6,
  process.env.GROQ_API_KEY_7,
  process.env.GROQ_API_KEY_8,
].filter(k => k && !k.includes('YOUR_GROQ_KEY'));

// ─── Mistral Pool ────────────────────────────────────────────────────────────
const mistralKeys = [
  process.env.MISTRAL_API_KEY_1,
  process.env.MISTRAL_API_KEY_2,
  process.env.MISTRAL_API_KEY_3,
  process.env.MISTRAL_API_KEY_4,
].filter(k => k && !k.includes('YOUR_MISTRAL_KEY'));

const groqClients   = groqKeys.map(k => ({ client: new Groq({ apiKey: k }), key: k }));
const mistralClients = mistralKeys.map(k => ({ client: new Mistral({ apiKey: k }), key: k }));

// ─── Blacklist (TPD/invalid keys skip until reset) ───────────────────────────
const blacklist = new Map(); // key -> expiry timestamp

function isBlacklisted(key) {
  if (!blacklist.has(key)) return false;
  if (Date.now() > blacklist.get(key)) { blacklist.delete(key); return false; }
  return true;
}

function blacklistKey(key, ms) {
  blacklist.set(key, Date.now() + ms);
}

function parseRetryAfterMs(errMessage) {
  // Groq error: "Please try again in 2m29.1s"
  const m = errMessage?.match(/(\d+)m([\d.]+)s/);
  if (m) return (parseInt(m[1]) * 60 + parseFloat(m[2])) * 1000;
  return 60 * 1000; // default 1 min
}

// ─── Try all Groq keys in order, skip blacklisted ───────────────────────────
async function callGroq(messages) {
  const available = groqClients.filter(c => !isBlacklisted(c.key));

  if (available.length === 0) {
    throw new Error('ALL_GROQ_EXHAUSTED');
  }

  for (let i = 0; i < available.length; i++) {
    const { client, key } = available[i];
    const keyLabel = `Groq Key #${groqKeys.indexOf(key) + 1}`;
    logger.info(`🔄 Trying ${keyLabel}`);

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 3000,
        temperature: 0.2,
      });
      logger.info(`✅ ${keyLabel} succeeded`);
      return response.choices[0].message.content;

    } catch (err) {
      const msg = err.message || '';
      const status = err.status || err.statusCode;

      if (status === 429) {
        const retryMs = parseRetryAfterMs(msg);
        if (msg.toLowerCase().includes('tokens per day') || msg.includes('TPD')) {
          // TPD — blacklist until reset time
          blacklistKey(key, retryMs);
          logger.warn(`⛔ ${keyLabel} TPD exhausted — blacklisted for ${Math.ceil(retryMs/60000)}m`);
        } else {
          // TPM — short blacklist
          blacklistKey(key, retryMs);
          logger.warn(`⚠️ ${keyLabel} TPM hit — skipping for ${Math.ceil(retryMs/1000)}s`);
        }
      } else if (status === 401) {
        // Invalid key — blacklist permanently for this session
        blacklistKey(key, 24 * 60 * 60 * 1000);
        logger.warn(`❌ ${keyLabel} invalid/expired — skipping`);
      } else {
        logger.warn(`⚠️ ${keyLabel} failed: ${msg.slice(0, 80)}`);
      }
    }
  }

  throw new Error('ALL_GROQ_EXHAUSTED');
}

// ─── Try all Mistral keys in order ──────────────────────────────────────────
async function callMistral(messages) {
  const available = mistralClients.filter(c => !isBlacklisted(c.key));

  if (available.length === 0) {
    throw new Error('ALL_MISTRAL_EXHAUSTED');
  }

  for (let i = 0; i < available.length; i++) {
    const { client, key } = available[i];
    const keyLabel = `Mistral Key #${mistralKeys.indexOf(key) + 1}`;
    logger.info(`🔄 Trying ${keyLabel} (Groq fallback)`);

    try {
      const response = await client.chat.complete({
        model: process.env.MODEL_NAME || 'mistral-small-latest',
        messages,
        maxTokens: 3000,
        temperature: 0.2,
      });
      logger.info(`✅ ${keyLabel} succeeded`);
      return response.choices[0].message.content;

    } catch (err) {
      const msg = err.message || '';
      const status = err.status || err.statusCode;
      if (status === 429) {
        const retryMs = parseRetryAfterMs(msg) || 60000;
        blacklistKey(key, retryMs);
        logger.warn(`⚠️ ${keyLabel} rate limited — skipping for ${Math.ceil(retryMs/1000)}s`);
      } else if (status === 401) {
        blacklistKey(key, 24 * 60 * 60 * 1000);
        logger.warn(`❌ ${keyLabel} invalid — skipping`);
      } else {
        logger.warn(`⚠️ ${keyLabel} failed: ${msg.slice(0, 80)}`);
      }
    }
  }

  throw new Error('ALL_MISTRAL_EXHAUSTED');
}

// ─── Main call: Groq first, Mistral fallback ─────────────────────────────────
async function callAI(messages) {
  try {
    return await callGroq(messages);
  } catch (err) {
    if (err.message === 'ALL_GROQ_EXHAUSTED') {
      logger.warn('⚠️ All Groq keys exhausted — falling back to Mistral');
      return await callMistral(messages);
    }
    throw err;
  }
}

// ─── Controller ──────────────────────────────────────────────────────────────
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
3. Keep all responses concise to save tokens until asked not to (IMPORTANT)
`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content.replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, ' (Itinerary data omitted) ')
      })),
      { role: 'user', content }
    ];

    const aiReply = await callAI(chatMessages);
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error('CHAT_ERROR:', error);
    if (error.message.includes('EXHAUSTED')) {
      return res.status(503).json({ error: 'All AI providers are currently unavailable. Please try again in a few minutes.' });
    }
    next(error);
  }
};

const getMessages    = async (req, res) => res.status(200).json({ messages: [] });
const saveOnlyMessage = async (req, res) => res.status(200).json({ message: 'No-op in MVP' });

module.exports = { sendMessage, getMessages, saveOnlyMessage };
