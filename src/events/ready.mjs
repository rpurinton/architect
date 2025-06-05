import log from '../log.mjs';
import { getMsg } from '../locales.mjs';

// Event handler for ready
export default async function (client) {
    log.info(`Logged in as ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: '\u26f7\ufe0f AI Administrator', type: 4 }], status: 'online' });
}
