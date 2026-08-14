const mongoose = require('mongoose');

// PlayerStatistics schema definition
const playerStatisticsSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    gameId: { type: String, required: true },
    score: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlayerStatistics', playerStatisticsSchema);
