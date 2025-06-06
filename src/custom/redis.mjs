import 'dotenv/config';
import log from '../log.mjs';
import Redis from 'ioredis';

let redis;

/**
 * Initialize the Redis client. Allows injection for testing.
 * @param {object} [client] Optional Redis client (for tests)
 */
export function initRedis(client) {
    if (client) {
        redis = client;
        return redis;
    }
    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
        throw new Error('REDIS_HOST and REDIS_PORT must be set in the environment variables');
    }
    try {
        redis = new Redis.Cluster([
            {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT)
            }
        ]);
        redis.on('error', (err) => {
            log.error('Redis connection error', err);
        });
    } catch (err) {
        log.error('Failed to create Redis Cluster instance', err);
        throw err;
    }
    return redis;
}

// Only auto-init if not in test environment
if (process.env.NODE_ENV !== 'test') {
    initRedis();
}

/**
 * Get a value by key from Redis.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function getKey(key) {
    try {
        return await redis.get(key);
    } catch (err) {
        log.error(`Failed to get key '${key}' from Redis`, err);
        throw err;
    }
}

/**
 * Set a value by key in Redis.
 * @param {string} key
 * @param {string} value
 * @param {number} [expire=3600] Expiration in seconds (0 = never expire)
 * @returns {Promise<void>}
 */
export async function setKey(key, value, expire = 0) {
    try {
        if (expire > 0) {
            await redis.set(key, value, 'EX', expire);
        } else {
            await redis.set(key, value);
        }
    } catch (err) {
        log.error(`Failed to set key '${key}' in Redis`, err);
        throw err;
    }
}

/**
 * Delete a key from Redis.
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function delKey(key) {
    try {
        await redis.del(key);
    } catch (err) {
        log.error(`Failed to delete key '${key}' from Redis`, err);
        throw err;
    }
}

export { redis as default };