const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    gameId: { type: String, required: true },
    userId: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, required: true }
});

module.exports = mongoose.model('Chat', chatSchema);
