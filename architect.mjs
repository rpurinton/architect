#!/usr/bin/env node
import 'dotenv/config';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { loadLocales } from './src/locales.mjs';
import { loadAndRegisterCommands } from './src/commands.mjs';
import { createAndLoginDiscordClient } from './src/discord.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import initializeMcpServer from './src/custom/mcp-server.mjs';
import initializeMcpClient from './src/custom/mcp-client.mjs';

(async () => {
  try {
    registerExceptionHandlers();
    loadLocales();
    global.commands = await loadAndRegisterCommands();
    global.client = await createAndLoginDiscordClient();

    // Initialize MCP server and client in main
    global.mcpServer = await initializeMcpServer();
    global.mcpClient = await initializeMcpClient();

    setupShutdownHandlers({ client: global.client, mcpServer: global.mcpServer, mcpClient: global.mcpClient });
  }
  catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
