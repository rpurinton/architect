import 'dotenv/config';
import fs from 'fs';
import log from '../log.mjs';
import { OpenAI } from 'openai';
import { getCurrentDirname } from '../esm-filename.mjs';

const dirname = getCurrentDirname(import.meta);
const baseConfig = JSON.parse(fs.readFileSync(`${dirname}/openai.json`, 'utf8'));

if (!process.env.OPENAI_API_KEY) {
    log.error('OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getReply(myUserId, guild, channel, messages) {
    const config = JSON.parse(JSON.stringify(baseConfig));
    if (!config.messages && !config.messages.length) {
        log.error('OpenAI configuration does not contain any messages.');
        return "An error occurred while processing your request. Please try again later.";
    }
    config.messages[0].content = config.messages[0].content
        .replace('{myUserId}', myUserId)
        .replace('{guildId}', guild.id)
        .replace('{guildName}', guild.name)
        .replace('{preferredLocale}', guild.preferredLocale || 'en-US')
        .replace('{channelId}', channel.id)
        .replace('{channelName}', channel.name)
        .replace('{channelTopic}', channel.topic || 'No topic set');

    messages = new Map([...messages.entries()].reverse());
    for (const message of messages.values()) {
        if (message.author.id === myUserId) {
            config.messages.push({
                role: 'assistant',
                content: message.content
            });
        } else {
            const timestamp = message.createdAt.toISOString();
            config.messages.push({
                role: 'user',
                content: `[${timestamp}] <@${message.author.id}> ${message.author.username}: ${message.content}`,
            });
        }
    }
    config.tools = convertTools(global.tools || []);
    let response;
    try {
        response = await openai.chat.completions.create(config);
    } catch (error) {
        log.error('Error calling OpenAI API:', error);
        return "An error occurred while processing your request. Please try again later.";
    }

    if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        log.error('No response from OpenAI API or response is malformed.');
        return "An error occurred while processing your request. Please try again later.";
    }

    // temp log whole response
    log.info('OpenAI API response:', response);

    if (!response.choices[0].message || !response.choices[0].message.content) {
        log.error('No content in the response from OpenAI API.');
        return "An error occurred while processing your request. Please try again later.";
    }
    const reply = response.choices[0].message.content.trim();
    if (reply === '') {
        log.error('Empty reply from OpenAI API.');
        return "An error occurred while processing your request. Please try again later.";
    }
    return reply;
}

export function splitMsg(msg, maxLength) {
    msg = msg.trim();
    if (msg === '') return [];
    if (msg.length <= maxLength) return [msg];
    const chunks = [];
    while (msg.length > maxLength) {
        let chunk = msg.slice(0, maxLength);
        let splitIndex = chunk.lastIndexOf('\n');
        if (splitIndex === -1) splitIndex = chunk.lastIndexOf('.');
        if (splitIndex === -1 || splitIndex < 1) splitIndex = maxLength;
        else splitIndex++;
        let part = msg.slice(0, splitIndex).trim();
        chunks.push(part);
        msg = msg.slice(splitIndex).trim();
    }
    if (msg !== '') chunks.push(msg);
    return chunks;
}

export function convertTools(tools) {
    if (!Array.isArray(tools)) return [];
    return tools.map(tool => {
        const parameters = { ...tool.inputSchema };
        if (parameters.$schema) delete parameters.$schema;
        if (parameters.description) delete parameters.description;
        if (parameters.title) delete parameters.title;
        // Per-tool strict: true if all properties are required, false if any are optional
        let strict = true;
        if (parameters.properties && typeof parameters.properties === 'object') {
            const propKeys = Object.keys(parameters.properties);
            const required = Array.isArray(parameters.required) ? parameters.required : [];
            if (propKeys.length > 0 && required.length !== propKeys.length) {
                strict = false;
            } else if (propKeys.some(key => !required.includes(key))) {
                strict = false;
            }
        }
        return {
            type: "function",
            function: {
                name: tool.name,
                description: tool.description || '',
                parameters,
                strict
            }
        };
    });
}