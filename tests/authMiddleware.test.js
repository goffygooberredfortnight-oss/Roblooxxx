const jwt = require('jsonwebtoken');
const auth = require('../src/middleware/authMiddleware');

jest.mock('jsonwebtoken');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('authMiddleware', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns 401 when no authorization header is present', () => {
        const req = { headers: {} };
        const res = mockResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when authorization header has no token', () => {
        const req = { headers: { authorization: 'Bearer' } };
        const res = mockResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('attaches the verified user and calls next for a valid token', () => {
        const payload = { id: 'user-1' };
        jwt.verify.mockReturnValue(payload);
        const req = { headers: { authorization: 'Bearer valid-token' } };
        const res = mockResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
        expect(req.user).toEqual(payload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 400 when token verification fails', () => {
        jwt.verify.mockImplementation(() => { throw new Error('bad token'); });
        const req = { headers: { authorization: 'Bearer invalid-token' } };
        const res = mockResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });
});
