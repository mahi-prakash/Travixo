const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, saveOnlyMessage } = require('../controllers/messages.controller');



router.post('/', sendMessage);
router.post('/save-only', saveOnlyMessage);
router.get('/:trip_id', getMessages);


module.exports = router;