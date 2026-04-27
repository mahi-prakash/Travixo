const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter: Limits total requests from any IP to prevent DDoS
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI Chat Specific Limiter: Stricter limit for expensive AI endpoints
 */
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 chat messages per minute
  message: {
    error: 'Too many messages! Please wait a minute before chatting again. (Protecting AI Limits)'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  chatLimiter
};
