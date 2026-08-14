const express = require('express');
const mongoose = require('mongoose');
const Game = require('../models/Game');
const GameInstance = require('../models/GameInstance');

const router = express.Router();

// Create a new game route
router.post('/', async (req, res) => {
    const { ownerId, title, description } = req.body;
    try {
        const newGame = await Game.create({
            ownerId,
            title,
            description,
            id: new mongoose.Types.ObjectId().toString()
        });
        res.status(201).json(newGame);
    } catch (error) {
        res.status(400).json({ error: 'Error creating game', details: error });
    }
});

// Get all games route
router.get('/', async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

// Get a game by id
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findOne({ id: req.params.id });
        if (!game) return res.status(404).json({ error: 'Game not found' });
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

// Start a game instance
router.post('/:id/start', async (req, res) => {
    const { hostId } = req.body;
    try {
        const newInstance = await GameInstance.create({
            gameId: req.params.id,
            hostId,
            id: new mongoose.Types.ObjectId().toString(),
            playerCount: 0
        });
        res.status(201).json(newInstance);
    } catch (error) {
        res.status(400).json({ error: 'Error starting game instance', details: error });
    }
});

module.exports = router;
