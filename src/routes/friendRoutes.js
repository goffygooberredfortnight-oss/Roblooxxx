const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add a Friend
router.post('/:userId/friends', async (req, res) => {
    const { friendId } = req.body;
    try {
        await User.findByIdAndUpdate(req.params.userId, { $addToSet: { friends: friendId } });
        res.status(200).json({ message: 'Friend added successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding friend.', error });
    }
});

// Get Friends List
router.get('/:userId/friends', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('friends');
        res.status(200).json(user.friends);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving friends.', error });
    }
});

// Invite Friends to a Game
router.post('/:userId/invite', async (req, res) => {
    const { friendId, gameId } = req.body;
    try {
        // This could trigger an email or a notification to the friend
        // For now, we will just return a message
        res.status(200).json({ message: `Invite sent to ${friendId} for game ${gameId}.` });
    } catch (error) {
        res.status(500).json({ message: 'Error sending invite.', error });
    }
});

module.exports = router;
