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

export async function getReply(myUserId, messages) {
    const config = JSON.parse(JSON.stringify(baseConfig));
    if (!config.messages && !config.messages.length) {
        log.error('OpenAI configuration does not contain any messages.');
        return "An error occurred while processing your request. Please try again later.";
    }
    config.messages[0].content = config.messages[0].content.replace('{myUserId}', myUserId);
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
    log.info(`Prompt`, config);
    const response = await openai.chat.completions.create(config);
    if (!response.choices || response.choices.length === 0) {
        log.error('No choices returned from OpenAI API.');
        return "An error occurred while processing your request. Please try again later.";
    }
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