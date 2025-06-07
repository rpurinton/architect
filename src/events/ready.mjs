import log from '../log.mjs';
import { getMsg } from '../locales.mjs';

// Event handler for ready
export default async function (client) {
    log.info(`Logged in as ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: '🏗️ AI Administrator', type: 4 }], status: 'online' });
    // Fetch all members for all guilds at startup
    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.members.fetch();
            log.info(`Fetched all members for guild: ${guild.name}`);
        } catch (err) {
            log.error(`Failed to fetch members for guild: ${guild.name}`, err);
        }
    }
}
