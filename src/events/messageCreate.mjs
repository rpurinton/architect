import log from '../log.mjs';
import { getMsg } from '../locales.mjs';
import { getReply, splitMsg } from '../custom/openai.mjs';

// Event handler for messageCreate
export default async function (message) {
    if (message.author.id === message.client.user.id) return;
    if (!message.guild) message.reply('Direct messages are not supported. Please use a channel in a server.');
    if (!message.mentions.has(message.client.user) && !message.reference?.message?.author?.id !== message.client.user.id) return;
    if (!message.member.permissions.has('ADMINISTRATOR')) return;
    message.channel.sendTyping();
    const messages = await message.channel.messages.fetch({ limit: 100 });
    const reply = await getReply(message.client.user.id, messages);
    if (!reply) {
        log.error('Failed to get a reply from OpenAI.');
        return message.reply('An error occurred while processing your request. Please try again later.');
    }
    for (const split of splitMsg(reply, 2000)) {
        await message.reply(split);
    }
}
