const Chat = require('../src/models/Chat');
const chatController = require('../src/controllers/chatController');

jest.mock('../src/models/Chat');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('chatController.sendMessage', () => {
    afterEach(() => jest.clearAllMocks());

    it('creates a chat message and returns 201', async () => {
        const created = { gameId: 'g1', userId: 'u1', message: 'hello' };
        Chat.create = jest.fn().mockResolvedValue(created);

        const req = { params: { gameId: 'g1' }, body: { userId: 'u1', message: 'hello' } };
        const res = mockResponse();

        await chatController.sendMessage(req, res);

        expect(Chat.create).toHaveBeenCalledWith({
            gameId: 'g1',
            userId: 'u1',
            message: 'hello',
            createdAt: expect.any(Date)
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(created);
    });

    it('returns 500 when message creation fails', async () => {
        Chat.create = jest.fn().mockRejectedValue(new Error('db error'));

        const req = { params: { gameId: 'g1' }, body: { userId: 'u1', message: 'hello' } };
        const res = mockResponse();

        await chatController.sendMessage(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unable to send message' });
    });
});

describe('chatController.getChatHistory', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns chat history sorted by createdAt', async () => {
        const history = [{ message: 'first' }, { message: 'second' }];
        const sort = jest.fn().mockResolvedValue(history);
        Chat.find = jest.fn().mockReturnValue({ sort });

        const req = { params: { gameId: 'g1' } };
        const res = mockResponse();

        await chatController.getChatHistory(req, res);

        expect(Chat.find).toHaveBeenCalledWith({ gameId: 'g1' });
        expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(history);
    });

    it('returns 500 when history retrieval fails', async () => {
        const sort = jest.fn().mockRejectedValue(new Error('db error'));
        Chat.find = jest.fn().mockReturnValue({ sort });

        const req = { params: { gameId: 'g1' } };
        const res = mockResponse();

        await chatController.getChatHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unable to retrieve chat history' });
    });
});
