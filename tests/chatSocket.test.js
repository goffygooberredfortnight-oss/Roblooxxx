const socketIo = require('socket.io');
const Chat = require('../src/models/Chat');
const chatSocket = require('../src/socket/chatSocket');

jest.mock('socket.io');
jest.mock('../src/models/Chat');

describe('chatSocket', () => {
    let io;
    let connectionHandler;

    beforeEach(() => {
        io = {
            on: jest.fn((event, handler) => {
                if (event === 'connection') connectionHandler = handler;
            }),
            to: jest.fn().mockReturnValue({ emit: jest.fn() })
        };
        socketIo.mockReturnValue(io);
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => jest.restoreAllMocks());

    const buildSocket = (gameId = 'g1') => {
        const handlers = {};
        return {
            handshake: { query: { gameId } },
            on: jest.fn((event, handler) => { handlers[event] = handler; }),
            join: jest.fn(),
            handlers
        };
    };

    it('initializes socket.io on the server and returns the io instance', () => {
        const server = {};
        const result = chatSocket(server);

        expect(socketIo).toHaveBeenCalledWith(server);
        expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function));
        expect(result).toBe(io);
    });

    it('joins the game room on connection', () => {
        chatSocket({});
        const socket = buildSocket('game-42');

        connectionHandler(socket);

        expect(socket.join).toHaveBeenCalledWith('game-42');
    });

    it('persists and broadcasts incoming messages', async () => {
        const chatMessage = { gameId: 'g1', userId: 'u1', message: 'hello' };
        Chat.create = jest.fn().mockResolvedValue(chatMessage);
        const emit = jest.fn();
        io.to.mockReturnValue({ emit });

        chatSocket({});
        const socket = buildSocket('g1');
        connectionHandler(socket);

        await socket.handlers.sendMessage({ userId: 'u1', message: 'hello' });

        expect(Chat.create).toHaveBeenCalledWith({
            gameId: 'g1',
            userId: 'u1',
            message: 'hello',
            createdAt: expect.any(Date)
        });
        expect(io.to).toHaveBeenCalledWith('g1');
        expect(emit).toHaveBeenCalledWith('newMessage', chatMessage);
    });

    it('logs on disconnect', () => {
        chatSocket({});
        const socket = buildSocket();
        connectionHandler(socket);

        socket.handlers.disconnect();

        expect(console.log).toHaveBeenCalledWith('Client disconnected');
    });
});
