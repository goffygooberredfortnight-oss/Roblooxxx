const express = require('express');
const request = require('supertest');
const User = require('../src/models/User');
const friendRoutes = require('../src/routes/friendRoutes');

jest.mock('../src/models/User');

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/users', friendRoutes);
    return app;
};

describe('friendRoutes', () => {
    const app = buildApp();

    afterEach(() => jest.clearAllMocks());

    describe('POST /api/users/:userId/friends', () => {
        it('adds a friend and returns 200', async () => {
            User.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const res = await request(app)
                .post('/api/users/u1/friends')
                .send({ friendId: 'u2' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Friend added successfully.' });
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u1', { $addToSet: { friends: 'u2' } });
        });

        it('returns 500 when the update fails', async () => {
            User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('db down'));

            const res = await request(app)
                .post('/api/users/u1/friends')
                .send({ friendId: 'u2' });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Error adding friend.');
        });
    });

    describe('GET /api/users/:userId/friends', () => {
        it('returns the friends list', async () => {
            const friends = ['u2', 'u3'];
            const populate = jest.fn().mockResolvedValue({ friends });
            User.findById = jest.fn().mockReturnValue({ populate });

            const res = await request(app).get('/api/users/u1/friends');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(friends);
            expect(User.findById).toHaveBeenCalledWith('u1');
        });

        it('returns 500 when the lookup fails', async () => {
            const populate = jest.fn().mockRejectedValue(new Error('db down'));
            User.findById = jest.fn().mockReturnValue({ populate });

            const res = await request(app).get('/api/users/u1/friends');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Error retrieving friends.');
        });
    });

    describe('POST /api/users/:userId/invite', () => {
        it('sends an invite message', async () => {
            const res = await request(app)
                .post('/api/users/u1/invite')
                .send({ friendId: 'u2', gameId: 'g1' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Invite sent to u2 for game g1.' });
        });
    });
});
