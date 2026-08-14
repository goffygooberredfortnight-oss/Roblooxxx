const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const userController = require('../src/controllers/userController');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/models/User');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('userController.register', () => {
    afterEach(() => jest.clearAllMocks());

    it('hashes the password, saves the user, and returns 201', async () => {
        bcrypt.hash.mockResolvedValue('hashed-password');
        const save = jest.fn().mockResolvedValue(undefined);
        User.mockImplementation(() => ({ save }));

        const req = { body: { id: 'u1', username: 'alice', email: 'a@example.com', password: 'pw' } };
        const res = mockResponse();

        await userController.register(req, res);

        expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
        expect(User).toHaveBeenCalledWith({
            id: 'u1',
            username: 'alice',
            email: 'a@example.com',
            passwordHash: 'hashed-password'
        });
        expect(save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('returns 500 when saving fails', async () => {
        bcrypt.hash.mockResolvedValue('hashed-password');
        const save = jest.fn().mockRejectedValue(new Error('duplicate key'));
        User.mockImplementation(() => ({ save }));

        const req = { body: { id: 'u1', username: 'alice', email: 'a@example.com', password: 'pw' } };
        const res = mockResponse();

        await userController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'duplicate key' });
    });
});

describe('userController.login', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns a token for valid credentials', async () => {
        User.findOne = jest.fn().mockResolvedValue({ id: 'u1', passwordHash: 'hash' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('signed-token');

        const req = { body: { username: 'alice', password: 'pw' } };
        const res = mockResponse();

        await userController.login(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ username: 'alice' });
        expect(bcrypt.compare).toHaveBeenCalledWith('pw', 'hash');
        expect(jwt.sign).toHaveBeenCalledWith({ id: 'u1' }, expect.any(String), { expiresIn: '1h' });
        expect(res.json).toHaveBeenCalledWith({ token: 'signed-token' });
    });

    it('returns 404 when the user does not exist', async () => {
        User.findOne = jest.fn().mockResolvedValue(null);

        const req = { body: { username: 'ghost', password: 'pw' } };
        const res = mockResponse();

        await userController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('returns 401 for an invalid password', async () => {
        User.findOne = jest.fn().mockResolvedValue({ id: 'u1', passwordHash: 'hash' });
        bcrypt.compare.mockResolvedValue(false);

        const req = { body: { username: 'alice', password: 'wrong' } };
        const res = mockResponse();

        await userController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('returns 500 when the lookup throws', async () => {
        User.findOne = jest.fn().mockRejectedValue(new Error('db down'));

        const req = { body: { username: 'alice', password: 'pw' } };
        const res = mockResponse();

        await userController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
    });
});
