import 'dotenv/config';
import fs from 'fs';
import log from '../log.mjs';
import { OpenAI } from 'openai';
import { getCurrentDirname } from '../esm-filename.mjs';
import { getKey, setKey } from './redis.mjs';

const dirname = getCurrentDirname(import.meta);
let baseConfigRaw = fs.readFileSync(`${dirname}/openai.json`, 'utf8');
if (process.env.MCP_TOKEN) {
    baseConfigRaw = baseConfigRaw.replace(/\{bearerToken\}/g, process.env.MCP_TOKEN);
}
const baseConfig = JSON.parse(baseConfigRaw);

// Allow logger injection for testing
let logger = log;
export function _setLogger(l) {
    logger = l;
}

if (!process.env.OPENAI_API_KEY) {
    logger.error('OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Export for test injection
export function _setOpenAIClient(client) {
    // For testing: replace the OpenAI client instance
    global._openai_test_client = client;
}

const getOpenAIClient = () => global._openai_test_client || openai;

export async function getReply(myUserId, guild, channel, messages) {
    const config = JSON.parse(JSON.stringify(baseConfig));
    if (!config.input || !config.input.length) {
        logger.error('OpenAI configuration does not contain any messages.');
        return "An error occurred while processing your request. Please try again later.";
    }

    const previousResponseId = await getKey(channel.id);
    if (previousResponseId) {
        config.input = [];
        config.previous_response_id = previousResponseId;
    } else {
        if (Array.isArray(config.input[0].content) && config.input[0].content.length > 0) {
            config.input[0].content[0].text = config.input[0].content[0].text
                .replace('{myUserId}', myUserId)
                .replace('{guildId}', guild.id)
                .replace('{guildName}', guild.name)
                .replace('{preferredLocale}', guild.preferredLocale || 'en-US')
                .replace('{channelId}', channel.id)
                .replace('{channelName}', channel.name)
                .replace('{channelTopic}', channel.topic || 'No topic set');
        }
    }

    // Build history messages in the correct format
    const historyMessages = [];
    for (const message of messages.values()) {
        if (message.author.id === myUserId) break;
        const timestamp = message.createdAt.toISOString();
        let text = JSON.stringify(message);
        const contentArr = [
            {
                type: 'input_text',
                text
            }
        ];

        let attachmentsIterable = [];
        if (message.attachments) {
            if (typeof message.attachments.values === 'function' && typeof message.attachments.toJSON === 'function') {
                // Convert to JSON to get plain objects with url fields
                attachmentsIterable = message.attachments.toJSON();
            } else if (Array.isArray(message.attachments)) {
                attachmentsIterable = message.attachments;
            } else if (typeof message.attachments === 'object' && message.attachments !== null) {
                attachmentsIterable = Object.values(message.attachments);
            }
        }
        let foundImage = false;
        for (const att of attachmentsIterable) {
            let url = undefined;
            if (typeof att.url === 'string' && att.url.length > 0) {
                url = att.url;
            } else if (typeof att.attachment === 'string' && att.attachment.length > 0) {
                url = att.attachment;
            } else if (typeof att.proxyURL === 'string' && att.proxyURL.length > 0) {
                url = att.proxyURL;
            }
            if (typeof url === 'string' && url.match(/\.(png|jpe?g|webp|gif)(?:\?.*)?$/i)) {
                contentArr.push({
                    type: 'input_image',
                    image_url: url
                });
                foundImage = true;
            }
        }
        if (!foundImage && attachmentsIterable && Array.from(attachmentsIterable).length > 0) {
            logger.warn('No valid image attachments found in attachmentsIterable.');
        }
        historyMessages.push({
            role: 'user',
            content: contentArr
        });
    }

    historyMessages.reverse();
    for (const msg of historyMessages) {
        config.input.push(msg);
    }

    let response;
    try {
        response = await getOpenAIClient().responses.create(config);
    } catch (error) {
        logger.error('Error calling OpenAI API:', error);
        return "An error occurred while processing your request. Please try again later.";
    }

    const responseId = response?.id;
    let reply = null;
    if (Array.isArray(response?.output) && response.output.length > 0) {
        const assistantMsg = response.output.find(msg => msg.role === 'assistant');
        if (assistantMsg && Array.isArray(assistantMsg.content) && assistantMsg.content.length > 0) {
            // Find the first output_text type
            const outputText = assistantMsg.content.find(c => c.type === 'output_text');
            if (outputText && typeof outputText.text === 'string') {
                reply = outputText.text.trim();
            }
        }
    }
    if (!reply) {
        // fallback to output_text at root if present
        if (typeof response.output_text === 'string' && response.output_text.trim() !== '') {
            reply = response.output_text.trim();
        }
    }
    if (!reply) {
        logger.error('Malformed or empty response from OpenAI API.', { response });
        return "An error occurred while processing your request. Please try again later.";
    }

    // Store response id in Redis for this channel
    if (responseId) {
        await setKey(channel.id, responseId);
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