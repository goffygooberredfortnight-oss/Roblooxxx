const socketIo = require('socket.io');
const Chat = require('../models/Chat');

module.exports = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('New client connected');
        const gameId = socket.handshake.query.gameId;

        // Listen for incoming messages
        socket.on('sendMessage', async ({ userId, message }) => {
            const chatMessage = await Chat.create({ gameId, userId, message, createdAt: new Date() });
            io.to(gameId).emit('newMessage', chatMessage);
        });

        // Join the room for the specific game
        socket.join(gameId);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};
