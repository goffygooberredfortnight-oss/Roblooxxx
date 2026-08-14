const User = require('../src/models/User');
const Game = require('../src/models/Game');
const GameInstance = require('../src/models/GameInstance');
const PlayerStatistics = require('../src/models/PlayerStatistics');
const Chat = require('../src/models/Chat');

describe('User model', () => {
    it('validates a well-formed user', () => {
        const user = new User({
            id: 'u1',
            username: 'alice',
            email: 'a@example.com',
            passwordHash: 'hash'
        });
        expect(user.validateSync()).toBeUndefined();
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        expect(user.friends).toEqual([]);
        expect(user.activity).toEqual([]);
    });

    it('requires id, username, email, and passwordHash', () => {
        const err = new User({}).validateSync();
        expect(err.errors).toHaveProperty('id');
        expect(err.errors).toHaveProperty('username');
        expect(err.errors).toHaveProperty('email');
        expect(err.errors).toHaveProperty('passwordHash');
    });
});

describe('Game model', () => {
    it('validates a well-formed game and allows missing description', () => {
        const game = new Game({ id: 'g1', ownerId: 'u1', title: 'My Game' });
        expect(game.validateSync()).toBeUndefined();
        expect(game.createdAt).toBeInstanceOf(Date);
    });

    it('requires id, ownerId, and title', () => {
        const err = new Game({}).validateSync();
        expect(err.errors).toHaveProperty('id');
        expect(err.errors).toHaveProperty('ownerId');
        expect(err.errors).toHaveProperty('title');
    });
});

describe('GameInstance model', () => {
    it('validates a well-formed instance and defaults playerCount to 0', () => {
        const instance = new GameInstance({ id: 'i1', gameId: 'g1', hostId: 'u1' });
        expect(instance.validateSync()).toBeUndefined();
        expect(instance.playerCount).toBe(0);
    });

    it('requires id, gameId, and hostId', () => {
        const err = new GameInstance({}).validateSync();
        expect(err.errors).toHaveProperty('id');
        expect(err.errors).toHaveProperty('gameId');
        expect(err.errors).toHaveProperty('hostId');
    });
});

describe('PlayerStatistics model', () => {
    it('validates a well-formed record and defaults score to 0', () => {
        const stats = new PlayerStatistics({ id: 's1', userId: 'u1', gameId: 'g1' });
        expect(stats.validateSync()).toBeUndefined();
        expect(stats.score).toBe(0);
    });

    it('requires id, userId, and gameId', () => {
        const err = new PlayerStatistics({}).validateSync();
        expect(err.errors).toHaveProperty('id');
        expect(err.errors).toHaveProperty('userId');
        expect(err.errors).toHaveProperty('gameId');
    });
});

describe('Chat model', () => {
    it('validates a well-formed message', () => {
        const chat = new Chat({ gameId: 'g1', userId: 'u1', message: 'hi', createdAt: new Date() });
        expect(chat.validateSync()).toBeUndefined();
    });

    it('requires gameId, userId, message, and createdAt', () => {
        const err = new Chat({}).validateSync();
        expect(err.errors).toHaveProperty('gameId');
        expect(err.errors).toHaveProperty('userId');
        expect(err.errors).toHaveProperty('message');
        expect(err.errors).toHaveProperty('createdAt');
    });
});
