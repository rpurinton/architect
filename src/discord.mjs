import 'dotenv/config';
import log from './log.mjs';
import setupEvents from './events.mjs';
import { Client, GatewayIntentBits } from 'discord.js';

/**
 * Creates and logs in a Discord client, allowing dependency injection for testability.
 * @param {Object} options
 * @param {string} [options.token] - Discord bot token
 * @param {Object} [options.logger] - Logger instance
 * @param {Function} [options.setupEventsFn] - Function to set up events
 * @param {Function} [options.ClientClass] - Discord client class
 * @param {Object} [options.GatewayIntentBitsObj] - Gateway intent bits
 * @param {Array} [options.partials] - Array of partials
 * @param {Object} [options.clientOptions] - Additional options for Discord client
 * @returns {Promise<Object>} Discord client instance
 */
export const createAndLoginDiscordClient = async ({
    token = process.env.DISCORD_TOKEN,
    logger = log,
    setupEventsFn = setupEvents,
    ClientClass = Client,
    GatewayIntentBitsObj = GatewayIntentBits,
    partials = ['MESSAGE', 'CHANNEL', 'REACTION'],
    clientOptions = {}
} = {}) => {
    if (!token) {
        throw new Error('Discord token is not set. Please check your .env file.');
    }
    // Sharding support
    const shardId = process.env.DISCORD_SHARD_ID !== undefined ? Number(process.env.DISCORD_SHARD_ID) : undefined;
    const shardCount = process.env.DISCORD_SHARD_COUNT !== undefined ? Number(process.env.DISCORD_SHARD_COUNT) : undefined;
    const shardOptions = {};
    if (!isNaN(shardId)) shardOptions.shards = shardId;
    if (!isNaN(shardCount)) shardOptions.shardCount = shardCount;
    const client = new ClientClass({
        intents: [
            GatewayIntentBitsObj.Guilds,
            GatewayIntentBitsObj.GuildMessages,
            GatewayIntentBitsObj.MessageContent,
            GatewayIntentBitsObj.GuildMembers,
            GatewayIntentBitsObj.GuildPresences,
            GatewayIntentBitsObj.GuildVoiceStates,
        ],
        partials,
        ...shardOptions,
        ...clientOptions
    });
    await setupEventsFn(client);
    try {
        await client.login(token);
    } catch (error) {
        logger.error('Failed to login:', error);
        throw error;
    }
    return client;
};
