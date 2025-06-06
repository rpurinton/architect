#!/usr/bin/env node
import 'dotenv/config';
import log from './src/log.mjs';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { loadLocales } from './src/locales.mjs';
import { loadAndRegisterCommands } from './src/commands.mjs';
import { createAndLoginDiscordClient } from './src/discord.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import initializeMcpServer from './src/custom/mcpServer.mjs';
//import initializeMcpClient from './src/custom/mcpClient.mjs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createHttpServer } from './src/custom/httpServer.mjs';

(async () => {
  try {
    registerExceptionHandlers();
    loadLocales();

    global.commands = await loadAndRegisterCommands();
    if (!global.commands || global.commands.length === 0) {
      log.error('No commands loaded. Please check your command registration.');
      process.exit(1);
    }

    global.client = await createAndLoginDiscordClient();
    if (!global.client) {
      log.error('Failed to create or login Discord client. Please check your configuration.');
      process.exit(1);
    }

    setupShutdownHandlers({ client: global.client });
    const mcpTransport = new StreamableHTTPServerTransport({});
    if (!mcpTransport) {
      log.error('Failed to create MCP transport. Please check your configuration.');
      process.exit(1);
    }

    const mcpServer = await initializeMcpServer(mcpTransport);
    if (!mcpServer) {
      log.error('Failed to initialize MCP server. Please check your configuration.');
      process.exit(1);
    }

    const { app, serverInstance } = createHttpServer({ log, mcpServer, mcpTransport, autoStartMcpServer: false });
    if (!app || !serverInstance) {
      log.error('Failed to create HTTP server. Please check your configuration.');
      process.exit(1);
    }

    const port = process.env.MCP_PORT || 9232;
    serverInstance.listen(port, () => { log.info(`MCP-HTTP Server listening on port ${port}`) });

    // global.mcpClient = await initializeMcpClient({ log });
    // if (!global.mcpClient) {
    //   log.error('Failed to initialize MCP client. Please check your configuration.');
    //   process.exit(1);
    // }

    // const tools = await global.mcpClient.listTools();
    // global.tools = tools.tools || [];
    // log.info(`MCP Server provides ${global.tools.length} tools`);
    // if (global.tools.length === 0) {
    //   log.error('No tools registered in MCP Server. Please check your tool registration.');
    //   process.exit(1);
    // }
  } catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
