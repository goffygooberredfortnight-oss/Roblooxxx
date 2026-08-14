const express = require('express');
const request = require('supertest');
const ChatController = require('../src/controllers/chatController');

jest.mock('../src/controllers/chatController', () => ({
    sendMessage: jest.fn((req, res) => res.status(201).json({ message: 'sent' })),
    getChatHistory: jest.fn((req, res) => res.status(200).json([]))
}));

const chatRoutes = require('../src/routes/chatRoutes');

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use(chatRoutes);
    return app;
};

describe('chatRoutes', () => {
    const app = buildApp();

    afterEach(() => jest.clearAllMocks());

    it('POST /api/games/:gameId/chat routes to sendMessage', async () => {
        const res = await request(app)
            .post('/api/games/g1/chat')
            .send({ userId: 'u1', message: 'hello' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ message: 'sent' });
        expect(ChatController.sendMessage).toHaveBeenCalled();
    });

    it('GET /api/games/:gameId/chat routes to getChatHistory', async () => {
        const res = await request(app).get('/api/games/g1/chat');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
        expect(ChatController.getChatHistory).toHaveBeenCalled();
    });
});
