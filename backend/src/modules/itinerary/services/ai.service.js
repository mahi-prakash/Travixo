const Groq = require('groq-sdk');
const logger = require('../../../utils/logger');
const { sendAlert } = require('../../../utils/notifier');

// ─── Key Pooling & Blacklist Logic ──────────────────────────────────────────

const groqKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(k => k && !k.includes('YOUR_GROQ_KEY'));

const groqClients = groqKeys.map(k => ({ client: new Groq({ apiKey: k }), key: k }));

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
  const minSecMatch = errMessage?.match(/(\d+)m([\d.]+)s/);
  if (minSecMatch) return (parseInt(minSecMatch[1]) * 60 + parseFloat(minSecMatch[2])) * 1000;

  const secMatch = errMessage?.match(/([\d.]+)s/);
  if (secMatch) return parseFloat(secMatch[1]) * 1000;

  if (errMessage?.toLowerCase().includes('rate limit')) return 60 * 1000;

  return 30 * 1000; // default 30s
}

// ─── AI Providers ────────────────────────────────────────────────────────────

async function callGroq(messages) {
  const available = groqClients.filter(c => !isBlacklisted(c.key));
  if (available.length === 0) throw new Error('ALL_GROQ_EXHAUSTED');

  for (let i = 0; i < available.length; i++) {
    const { client, key } = available[i];
    const keyLabel = `Groq Key #${groqClients.findIndex(c => c.key === key) + 1}`;

    try {
      const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 2500,
        temperature: 0.2,
      });
      return response.choices[0].message.content;

    } catch (err) {
      const msg = err.message || '';
      const status = err.status || err.statusCode;

      if (status === 429) {
        const retryMs = parseRetryAfterMs(msg);
        const isTPD = msg.includes('TPD') || msg.toLowerCase().includes('tokens per day');

        const duration = isTPD ? Math.max(retryMs, 3600000) : retryMs;
        blacklistKey(key, duration);

        if (isTPD) {
          sendAlert('Groq Quota Exhausted (TPD)', `Key: ${keyLabel}\nRetry After: ${Math.ceil(duration / 1000)}s`);
        }

        logger.warn(`⚠️ ${keyLabel} ${isTPD ? 'TPD Exhausted' : 'Rate Limited'} — skipping for ${Math.ceil(duration / 1000)}s`);
        continue;
      } else if (status === 401) {
        blacklistKey(key, 24 * 60 * 60 * 1000);
        sendAlert('Invalid/Expired AI Key', `Key: ${keyLabel} (Groq) has been rejected by the provider.`);
        logger.error(`❌ ${keyLabel} is INVALID or EXPIRED — removed from pool`);
        continue;
      } else {
        logger.warn(`⚠️ ${keyLabel} error: ${msg.slice(0, 100)}`);
        continue;
      }
    }
  }
  throw new Error('ALL_GROQ_EXHAUSTED');
}

// ─── AI Response Cache ────────────────────────────────────────────────────────

const aiResponseCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const generateAiResponse = async (messages) => {
  const cacheKey = JSON.stringify(messages);

  if (aiResponseCache.has(cacheKey)) {
    const cachedEntry = aiResponseCache.get(cacheKey);
    if (Date.now() < cachedEntry.expiry) {
      logger.info('⚡ Served AI response from IN-MEMORY CACHE! Latency bypassed.');
      return cachedEntry.data;
    } else {
      aiResponseCache.delete(cacheKey);
    }
  }

  const response = await callGroq(messages);

  aiResponseCache.set(cacheKey, {
    data: response,
    expiry: Date.now() + CACHE_TTL_MS
  });

  return response;
};

module.exports = {
  generateAiResponse,
};
