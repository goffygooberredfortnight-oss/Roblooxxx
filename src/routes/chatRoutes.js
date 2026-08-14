const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');

// Send a message to chat
router.post('/api/games/:gameId/chat', ChatController.sendMessage);

// Get chat history for a specific game
router.get('/api/games/:gameId/chat', ChatController.getChatHistory);

module.exports = router;
