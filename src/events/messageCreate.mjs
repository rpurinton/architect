import log from '../log.mjs';
import { getMsg } from '../locales.mjs';

// Event handler for messageCreate
export default async function (message) {
    if (!message.guild) message.reply('Direct messages are not supported. Please use a channel in a server.');
    if (!message.mentions.has(message.client.user) && !message.reference?.message?.author?.id === message.client.user.id) {
        return;
    }
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return;
    }
    message.reply("Hello");
}
