const express = require('express');
const request = require('supertest');
const userController = require('../src/controllers/userController');

jest.mock('../src/controllers/userController', () => ({
    register: jest.fn((req, res) => res.status(201).json({ message: 'registered' })),
    login: jest.fn((req, res) => res.status(200).json({ token: 'token' }))
}));

const userRoutes = require('../src/routes/userRoutes');

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    return app;
};

describe('userRoutes', () => {
    const app = buildApp();

    afterEach(() => jest.clearAllMocks());

    it('POST /api/users/register routes to the register controller', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ username: 'alice', email: 'a@example.com', password: 'pw' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ message: 'registered' });
        expect(userController.register).toHaveBeenCalled();
    });

    it('POST /api/users/login routes to the login controller', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({ username: 'alice', password: 'pw' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ token: 'token' });
        expect(userController.login).toHaveBeenCalled();
    });

    it('returns 404 for unknown user routes', async () => {
        const res = await request(app).get('/api/users/unknown');
        expect(res.status).toBe(404);
    });
});
