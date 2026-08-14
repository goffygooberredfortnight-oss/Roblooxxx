const Chat = require('../models/Chat');

exports.sendMessage = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { userId, message } = req.body;
        const chatMessage = await Chat.create({ gameId, userId, message, createdAt: new Date() });
        return res.status(201).json(chatMessage);
    } catch (error) {
        return res.status(500).json({ error: 'Unable to send message' });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const { gameId } = req.params;
        const chatHistory = await Chat.find({ gameId }).sort({ createdAt: 1 });
        return res.status(200).json(chatHistory);
    } catch (error) {
        return res.status(500).json({ error: 'Unable to retrieve chat history' });
    }
};
