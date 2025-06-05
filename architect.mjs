#!/usr/bin/env node
import 'dotenv/config';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { loadLocales } from './src/locales.mjs';
import { loadAndRegisterCommands } from './src/commands.mjs';
import { createAndLoginDiscordClient } from './src/discord.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import initializeHttpServer, { activeMcpServers } from './src/custom/httpServer.mjs';
import initializeMcpClient from './src/custom/mcpClient.mjs';

(async () => {
  try {
    registerExceptionHandlers();
    loadLocales();
    global.commands = await loadAndRegisterCommands();
    global.client = await createAndLoginDiscordClient();
    global.httpServer = await initializeHttpServer();
    global.mcpClient = await initializeMcpClient();

    setupShutdownHandlers({
      client: global.client,
      httpServer: global.httpServer,
      mcpClient: global.mcpClient,
      activeMcpServers, // pass all active MCP servers for shutdown
    });
  }
  catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
