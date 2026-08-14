const mongoose = require('mongoose');

// GameInstance schema definition
const gameInstanceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    gameId: { type: String, required: true },
    hostId: { type: String, required: true },
    playerCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameInstance', gameInstanceSchema);
