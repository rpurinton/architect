import 'dotenv/config';
import fs from 'fs';
import log from '../log.mjs';
import { OpenAI } from 'openai';
import { getCurrentDirname } from '../esm-filename.mjs';
import { getKey, setKey } from './redis.mjs';

const dirname = getCurrentDirname(import.meta);
let baseConfigRaw = fs.readFileSync(`${dirname}/openai.json`, 'utf8');
if (process.env.MCP_TOKEN) {
    baseConfigRaw = baseConfigRaw.replace(/\{mcpToken\}/g, process.env.MCP_TOKEN);
}
if (process.env.MCP_URL) {
    baseConfigRaw = baseConfigRaw.replace(/\{mcpUrl\}/g, process.env.MCP_URL);
}
const baseConfig = JSON.parse(baseConfigRaw);

if (global.mcpServer && typeof global.mcpServer.getRegisteredToolsForOpenAI === 'function') {
    const toolsList = global.mcpServer.getRegisteredToolsForOpenAI();
    log.info(`Tools`, JSON.stringify(toolsList, null, 2));
}

let logger = log;
export function _setLogger(l) {
    logger = l;
}

if (!process.env.OPENAI_API_KEY) {
    logger.error('OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function _setOpenAIClient(client) {
    global._openai_test_client = client;
}

const getOpenAIClient = () => global._openai_test_client || openai;

export async function getReply(myUserId, guild, channel, messages) {
    logger.debug('getReply called with:', { myUserId, guild_id: guild.id, channel_id: channel.id, messages_count: messages.size });
    const config = JSON.parse(JSON.stringify(baseConfig));
    if (!config.input || !config.input.length) {
        logger.error('OpenAI configuration does not contain any messages.');
        return { text: "An error occurred while processing your request. Please try again later.", images: [] };
    }

    const previousResponseId = await getKey(channel.id);
    let newConversation = false;
    if (previousResponseId) {
        config.input = [];
        config.previous_response_id = previousResponseId;
    } else {
        newConversation = true;
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

    const historyMessages = [];
    for (const message of messages.values()) {
        if (!newConversation && message.author.id === myUserId) break;
        if (newConversation && message.author.id === myUserId) {
            historyMessages.push({
                role: 'assistant',
                content: [{ type: 'output_text', text: message.content }]
            });
            continue;
        }
        let text = JSON.stringify(message);
        const contentArr = [{ type: 'input_text', text }];

        let attachmentsIterable = [];
        if (message.attachments) {
            if (typeof message.attachments.values === 'function' && typeof message.attachments.toJSON === 'function') {
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
        logger.debug('OpenAI API Call', config);
        response = await getOpenAIClient().responses.create(config);
        logger.debug('OpenAI API Response', response);
    } catch (error) {
        logger.error('Error calling OpenAI API:', error);
        return { text: "An error occurred while processing your request. Please try again later.", images: [] };
    }

    const responseId = response?.id;
    let reply = null;
    let images = [];
    if (Array.isArray(response?.output) && response.output.length > 0) {
        // Collect images from image_generation_call
        for (const item of response.output) {
            if (item.type === 'image_generation_call' && item.result && typeof item.result === 'string') {
                try {
                    const buffer = Buffer.from(item.result, 'base64');
                    const filename = `openai_image_${item.id || Date.now()}.png`;
                    images.push({
                        buffer,
                        filename,
                        description: item.revised_prompt || 'Generated image',
                        size: item.size || undefined
                    });
                } catch (e) {
                    logger.error('Failed to decode OpenAI image result', e);
                }
            }
        }
        const assistantMsg = response.output.find(msg => msg.role === 'assistant');
        if (assistantMsg && Array.isArray(assistantMsg.content) && assistantMsg.content.length > 0) {
            const outputText = assistantMsg.content.find(c => c.type === 'output_text');
            if (outputText && typeof outputText.text === 'string') {
                reply = outputText.text.trim();
            }
        }
    }
    if (!reply) {
        if (typeof response.output_text === 'string' && response.output_text.trim() !== '') {
            reply = response.output_text.trim();
        }
    }
    if (!reply) {
        logger.error('Malformed or empty response from OpenAI API.', { response });
        reply = "An error occurred while processing your request. Please try again later.";
    }

    if (responseId) {
        await setKey(channel.id, responseId);
    }
    return { text: reply, images };
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