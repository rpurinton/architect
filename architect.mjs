#!/usr/bin/env node
import 'dotenv/config';
import log from './src/log.mjs';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { loadLocales } from './src/locales.mjs';
import { loadAndRegisterCommands } from './src/commands.mjs';
import { createAndLoginDiscordClient } from './src/discord.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import initializeMcpServer from './src/custom/mcpServer.mjs';
import initializeMcpClient from './src/custom/mcpClient.mjs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createHttpServer } from './src/custom/httpServer.mjs';

(async () => {
  try {
    registerExceptionHandlers();
    loadLocales();
    global.commands = await loadAndRegisterCommands();
    global.client = await createAndLoginDiscordClient();
    const mcpTransport = new StreamableHTTPServerTransport({});
    const mcpServer = await initializeMcpServer(mcpTransport);
    const { app, serverInstance } = createHttpServer({ log, mcpServer, mcpTransport, autoStartMcpServer: false });
    const port = process.env.PORT || 9232;
    serverInstance.listen(port, () => {
      log.info(`MCP HTTP Server listening on port ${port}`);
    });
    global.httpServer = { app, serverInstance, mcpServer };

    // Initialize MCP client singleton
    global.mcpClient = await initializeMcpClient({ log });

    // Query tools from MCP server and log the count
    if (global.mcpClient && typeof global.mcpClient.listTools === 'function') {
      try {
        const tools = await global.mcpClient.listTools();
        log.info(`MCP Server provides ${tools.length || 0} tools`);
      } catch (err) {
        log.debug('Failed to query tools from MCP server:', err);
      }
    }

    setupShutdownHandlers({ client: global.client });
  }
  catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
