import 'dotenv/config';
import Redis from 'ioredis';

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    throw new Error('REDIS_HOST and REDIS_PORT must be set in the environment variables');
}

const redis = new Redis.Cluster([{ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }]);