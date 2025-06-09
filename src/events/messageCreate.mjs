import log from '../log.mjs';
import { getMsg } from '../locales.mjs';
import { getReply, splitMsg } from '../custom/openai.mjs';

// Per-channel message queue and lock
const channelLocks = new Map();

async function enqueueMessage(channelId, handler) {
    if (!channelLocks.has(channelId)) {
        channelLocks.set(channelId, []);
    }
    return new Promise((resolve, reject) => {
        channelLocks.get(channelId).push({ handler, resolve, reject });
        if (channelLocks.get(channelId).length === 1) {
            processQueue(channelId);
        }
    });
}

async function processQueue(channelId) {
    const queue = channelLocks.get(channelId);
    if (!queue || queue.length === 0) return;
    const { handler, resolve, reject } = queue[0];
    try {
        const result = await handler();
        resolve(result);
    } catch (err) {
        reject(err);
    } finally {
        queue.shift();
        if (queue.length > 0) {
            processQueue(channelId);
        } else {
            channelLocks.delete(channelId);
        }
    }
}

// Event handler for messageCreate
export default async function (message) {
    if (message.author.id === message.client.user.id) return;
    if (!message.guild) message.reply('Direct messages are not supported. Please use a channel in a server.');
    const isMentioned = message.mentions.has(message.client.user);
    const isReplyToBot = message.reference?.message?.author?.id === message.client.user.id;
    const containsHeyArchi = /hey archi/i.test(message.content);
    if (!(isMentioned || isReplyToBot || containsHeyArchi)) return;
    if (!message.member.permissions.has('ADMINISTRATOR')) return;
    await enqueueMessage(message.channel.id, async () => {
        let typingInterval;
        let typingTimeout;
        try {
            message.channel.sendTyping();
            typingInterval = setInterval(() => {
                message.channel.sendTyping();
            }, 5000);
            typingTimeout = setTimeout(() => {
                if (typingInterval) clearInterval(typingInterval);
                typingInterval = null;
            }, 180000); // 3 minutes
            const messages = await message.channel.messages.fetch({ limit: 100 });
            const replyObj = await getReply(message.client.user.id, message.guild, message.channel, messages);
            if (typingInterval) clearInterval(typingInterval);
            if (typingTimeout) clearTimeout(typingTimeout);
            if (!replyObj || !replyObj.text) {
                log.error('Failed to get a reply from OpenAI.');
                return message.reply('An error occurred while processing your request. Please try again later.');
            }
            // Send text and images in a single message if images are present
            if (Array.isArray(replyObj.images) && replyObj.images.length > 0) {
                await message.channel.send({
                    content: replyObj.text,
                    files: replyObj.images.map(img => ({
                        attachment: img.buffer,
                        name: img.filename,
                        description: img.description || undefined // This is used as alt text in Discord
                    }))
                });
            } else {
                // Send text reply (split if needed)
                for (const split of splitMsg(replyObj.text, 2000)) {
                    await message.channel.send(split);
                }
            }
        } catch (error) {
            if (typingInterval) clearInterval(typingInterval);
            if (typingTimeout) clearTimeout(typingTimeout);
            log.error('Error in messageCreate event:', error);
            message.reply('An error occurred while processing your request. Please try again later.');
        }
    });
}