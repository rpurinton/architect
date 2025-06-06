import { jest } from '@jest/globals';
import { initRedis, getKey, setKey, delKey } from '../../src/custom/redis.mjs';
import Redis from 'ioredis';

describe('redis.mjs', () => {
    let mockRedis;

    beforeEach(() => {
        mockRedis = {
            get: jest.fn(async (key) => key === 'exists' ? 'value' : null),
            set: jest.fn(async () => 'OK'),
            del: jest.fn(async () => 1),
            on: jest.fn(),
        };
        initRedis(mockRedis);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get a value by key', async () => {
        const value = await getKey('exists');
        expect(value).toBe('value');
        expect(mockRedis.get).toHaveBeenCalledWith('exists');
    });

    it('should return null for missing key', async () => {
        const value = await getKey('missing');
        expect(value).toBeNull();
        expect(mockRedis.get).toHaveBeenCalledWith('missing');
    });

    it('should set a value by key without expire', async () => {
        await setKey('foo', 'bar');
        expect(mockRedis.set).toHaveBeenCalledWith('foo', 'bar');
    });

    it('should set a value by key with expire', async () => {
        await setKey('foo', 'bar', 60);
        expect(mockRedis.set).toHaveBeenCalledWith('foo', 'bar', 'EX', 60);
    });

    it('should delete a key', async () => {
        await delKey('foo');
        expect(mockRedis.del).toHaveBeenCalledWith('foo');
    });
});
