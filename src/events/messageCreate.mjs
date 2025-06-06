import log from '../log.mjs';
import { getMsg } from '../locales.mjs';
import { getReply, splitMsg } from '../custom/openai.mjs';

// Event handler for messageCreate
export default async function (message) {
    if (message.author.id === message.client.user.id) return;
    if (!message.guild) message.reply('Direct messages are not supported. Please use a channel in a server.');
    const isMentioned = message.mentions.has(message.client.user);
    const isReplyToBot = message.reference?.message?.author?.id === message.client.user.id;
    const containsHeyArchi = /hey archi/i.test(message.content);
    if (!(isMentioned || isReplyToBot || containsHeyArchi)) return;
    if (!message.member.permissions.has('ADMINISTRATOR')) return;
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
        }, 60000);
        const messages = await message.channel.messages.fetch({ limit: 100 });
        const reply = await getReply(message.client.user.id, message.guild, message.channel, messages);
        if (typingInterval) clearInterval(typingInterval);
        if (typingTimeout) clearTimeout(typingTimeout);
        if (!reply) {
            log.error('Failed to get a reply from OpenAI.');
            return message.reply('An error occurred while processing your request. Please try again later.');
        }
        for (const split of splitMsg(reply, 2000)) {
            await message.channel.send(split);
        }
    } catch (error) {
        if (typingInterval) clearInterval(typingInterval);
        if (typingTimeout) clearTimeout(typingTimeout);
        log.error('Error in messageCreate event:', error);
        message.reply('An error occurred while processing your request. Please try again later.');
    }
}