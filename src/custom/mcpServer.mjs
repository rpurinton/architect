import 'dotenv/config';
import log from '../log.mjs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import getGuildsTool from './tools/getGuilds.mjs';

const mcpServer = new McpServer(
  { name: 'Architect MCP Server', version: '1.0.0' },
  { capabilities: { resources: {} } }
);

export default async function initializeMcpServer(mcpTransport) {
  try {
    await mcpServer.connect(mcpTransport);
    log.info('MCP Server connected');
    // Register MCP tools
    try {
      getGuildsTool(mcpServer);
      log.info('Registered MCP tools');
    } catch (toolErr) {
      log.error('Error registering MCP tools:', toolErr);
    }
  } catch (err) {
    log.error('MCP Server connection error:', err && err.stack ? err.stack : err);
    throw err;
  }
  return mcpServer;
}
