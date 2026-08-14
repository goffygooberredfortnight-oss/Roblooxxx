const express = require('express');
const request = require('supertest');
const Game = require('../src/models/Game');
const GameInstance = require('../src/models/GameInstance');
const gameRoutes = require('../src/routes/gameRoutes');

jest.mock('../src/models/Game');
jest.mock('../src/models/GameInstance');

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/games', gameRoutes);
    return app;
};

describe('gameRoutes', () => {
    const app = buildApp();

    afterEach(() => jest.clearAllMocks());

    describe('POST /api/games', () => {
        it('creates a game and returns 201', async () => {
            const created = { id: 'g1', ownerId: 'u1', title: 'My Game' };
            Game.create = jest.fn().mockResolvedValue(created);

            const res = await request(app)
                .post('/api/games')
                .send({ ownerId: 'u1', title: 'My Game', description: 'Fun' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(created);
            expect(Game.create).toHaveBeenCalledWith(expect.objectContaining({
                ownerId: 'u1',
                title: 'My Game',
                description: 'Fun',
                id: expect.any(String)
            }));
        });

        it('returns 400 when creation fails', async () => {
            Game.create = jest.fn().mockRejectedValue(new Error('validation failed'));

            const res = await request(app).post('/api/games').send({ title: 'Bad' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Error creating game');
        });
    });

    describe('GET /api/games', () => {
        it('returns all games', async () => {
            const games = [{ id: 'g1', title: 'A' }, { id: 'g2', title: 'B' }];
            Game.find = jest.fn().mockResolvedValue(games);

            const res = await request(app).get('/api/games');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(games);
        });

        it('returns 500 when the lookup fails', async () => {
            Game.find = jest.fn().mockRejectedValue(new Error('db down'));

            const res = await request(app).get('/api/games');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Internal server error');
        });
    });

    describe('GET /api/games/:id', () => {
        it('returns the game when found', async () => {
            const game = { id: 'g1', title: 'A' };
            Game.findOne = jest.fn().mockResolvedValue(game);

            const res = await request(app).get('/api/games/g1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(game);
            expect(Game.findOne).toHaveBeenCalledWith({ id: 'g1' });
        });

        it('returns 404 when the game is missing', async () => {
            Game.findOne = jest.fn().mockResolvedValue(null);

            const res = await request(app).get('/api/games/missing');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Game not found');
        });

        it('returns 500 when the lookup fails', async () => {
            Game.findOne = jest.fn().mockRejectedValue(new Error('db down'));

            const res = await request(app).get('/api/games/g1');

            expect(res.status).toBe(500);
        });
    });

    describe('POST /api/games/:id/start', () => {
        it('creates a game instance and returns 201', async () => {
            const instance = { id: 'i1', gameId: 'g1', hostId: 'u1', playerCount: 0 };
            GameInstance.create = jest.fn().mockResolvedValue(instance);

            const res = await request(app)
                .post('/api/games/g1/start')
                .send({ hostId: 'u1' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(instance);
            expect(GameInstance.create).toHaveBeenCalledWith(expect.objectContaining({
                gameId: 'g1',
                hostId: 'u1',
                playerCount: 0
            }));
        });

        it('returns 400 when instance creation fails', async () => {
            GameInstance.create = jest.fn().mockRejectedValue(new Error('validation failed'));

            const res = await request(app).post('/api/games/g1/start').send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Error starting game instance');
        });
    });
});
