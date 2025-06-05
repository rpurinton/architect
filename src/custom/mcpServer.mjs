import 'dotenv/config';
import log from '../log.mjs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import getGuildsTool from './tools/getGuilds.mjs';

export default async function initializeMcpServer(mcpTransport) {
  // Always create a new instance per call
  const mcpServer = new McpServer(
    { name: 'Architect MCP Server', version: '1.0.0' },
    { capabilities: { resources: {} } }
  );
  try {
    // Register MCP tools BEFORE connecting
    try {
      getGuildsTool(mcpServer); // Use the same tool name for all instances
      log.info('Registered MCP tools');
    } catch (toolErr) {
      log.error('Error registering MCP tools:', toolErr);
    }
    await mcpServer.connect(mcpTransport);
    log.info('MCP Server connected');
  } catch (err) {
    log.error('MCP Server connection error:', err && err.stack ? err.stack : err);
    throw err;
  }
  return mcpServer;
}
