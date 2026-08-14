const mongoose = require('mongoose');

// Game schema definition
const gameSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field on every save
gameSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Game', gameSchema);
