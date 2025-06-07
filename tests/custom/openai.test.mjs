import { jest } from '@jest/globals';

jest.mock('../../src/log.mjs', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
}));
jest.mock('../../src/custom/redis.mjs', () => ({
    setKey: jest.fn(async () => { }),
    getKey: jest.fn(async () => null),
}));

import { getReply, _setOpenAIClient, _setLogger } from '../../src/custom/openai.mjs';
import * as redisModule from '../../src/custom/redis.mjs';

describe('getReply', () => {
    let mockOpenAI;

    beforeAll(() => {
        if (redisModule.initRedis) {
            redisModule.initRedis({
                get: jest.fn(async () => null),
                set: jest.fn(async () => { }),
                del: jest.fn(async () => { })
            });
        }
        _setLogger(jest.requireMock('../../src/log.mjs'));
        mockOpenAI = {
            responses: {
                create: jest.fn(async (config) => ({
                    id: 'resp-123',
                    output: [
                        {
                            role: 'assistant',
                            content: [
                                { type: 'output_text', text: 'Hello, world!' }
                            ]
                        }
                    ]
                }))
            }
        };
        _setOpenAIClient(mockOpenAI);
    });

    afterAll(() => {
        jest.restoreAllMocks();
        _setOpenAIClient(undefined);
    });

    it('returns a reply from OpenAI', async () => {
        const myUserId = 'bot';
        const guild = { id: 'g1', name: 'Guild', preferredLocale: 'en-US' };
        const channel = { id: 'c1', name: 'general', topic: 't', };
        const messages = new Map([
            ['1', { author: { id: 'u1', username: 'user' }, createdAt: new Date('2024-01-01T00:00:00Z'), content: 'Hi!' }],
            ['2', { author: { id: 'bot', username: 'bot' }, createdAt: new Date('2024-01-01T00:01:00Z'), content: 'Hello!' }],
        ]);
        const reply = await getReply(myUserId, guild, channel, messages);
        expect(reply).toBe('Hello, world!');
        expect(mockOpenAI.responses.create).toHaveBeenCalled();
    });

    it('returns error message on OpenAI error', async () => {
        mockOpenAI.responses.create.mockRejectedValueOnce(new Error('fail'));
        const myUserId = 'bot';
        const guild = { id: 'g1', name: 'Guild', preferredLocale: 'en-US' };
        const channel = { id: 'c1', name: 'general', topic: 't', };
        const messages = new Map();
        const reply = await getReply(myUserId, guild, channel, messages);
        expect(reply).toMatch(/An error occurred/);
    });
});
