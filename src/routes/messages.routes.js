const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, saveOnlyMessage } = require('../controllers/messages.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const { chatLimiter } = require('../middlewares/rateLimit.middleware');

router.use(authMiddleware);

// Apply chat limiter specifically to AI message generation
router.post('/', chatLimiter, sendMessage);
router.post('/save-only', saveOnlyMessage);
router.get('/:trip_id', getMessages);


module.exports = router;