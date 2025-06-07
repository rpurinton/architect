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
    if (!global.commands || global.commands.length === 0) {
      log.error('No commands loaded.');
      process.exit(1);
    }

    const mcpTransport = new StreamableHTTPServerTransport({});
    if (!mcpTransport) {
      log.error('Failed to create MCP transport.');
      process.exit(1);
    }

    const mcpServer = await initializeMcpServer(mcpTransport);
    if (!mcpServer) {
      log.error('Failed to initialize MCP server.');
      process.exit(1);
    }

    const { app, httpInstance } = createHttpServer({ log, mcpServer, mcpTransport, autoStartMcpServer: false });
    if (!app || !httpInstance) {
      log.error('Failed to create HTTP server.');
      process.exit(1);
    }

    global.httpInstance = httpInstance;
    global.mcpServer = mcpServer;

    const port = process.env.MCP_PORT || 9232;
    httpInstance.listen(port, () => { log.info(`HTTP Server listening on port ${port}`) });

    const mcpClient = await initializeMcpClient({ log });
    if (!mcpClient) {
      log.error('Failed to initialize MCP client.');
      process.exit(1);
    }

    const tools = await mcpClient.listTools();
    global.tools = tools.tools || [];
    log.info(`MCP Server provides ${global.tools.length} tools`);
    if (global.tools.length === 0) {
      log.error('No tools registered in MCP Server. Please check your tool registration.');
      process.exit(1);
    }

    if (typeof mcpClient.close === 'function') {
      await mcpClient.close();
      log.info('MCP Client connection closed after retrieving tools.');
    }

    global.discord = await createAndLoginDiscordClient();
    if (!global.discord) {
      log.error('Failed to create or login Discord client.');
      process.exit(1);
    }
    setupShutdownHandlers({ client: global.discord });

  } catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
