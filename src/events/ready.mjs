import log from '../log.mjs';
import { getMsg } from '../locales.mjs';
import initializeMcpServer from '../custom/mcp-server.mjs';
import initializeMcpClient from '../custom/mcp-client.mjs';

// Event handler for ready
export default async function (client) {
    log.info(`Logged in as ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: '\u26f7\ufe0f AI Administrator', type: 4 }], status: 'online' });

    try {
        const mcpServer = await initializeMcpServer();
        log.info('MCP Server initialized');

        const mcpClient = await initializeMcpClient();
        log.info('MCP Client initialized');
    } catch (error) {
        log.error('Error initializing MCP components:', error);
    }
}
