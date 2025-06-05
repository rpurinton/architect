import 'dotenv/config';
import log from '../log.mjs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import listGuildsTool from './tools/listGuilds.mjs';
import listCategoriesTool from './tools/listCategories.mjs';
import listChannelsTool from './tools/listChannels.mjs';
import listRolesTool from './tools/listRoles.mjs';
import listMembersTool from './tools/listMembers.mjs';
import getGuildTool from './tools/getGuild.mjs';
import getCategoryTool from './tools/getCategory.mjs';
import getChannelTool from './tools/getChannel.mjs';
import getRoleTool from './tools/getRole.mjs';
import getMemberTool from './tools/getMember.mjs';

export default async function initializeMcpServer(mcpTransport) {
  // Always create a new instance per call
  const mcpServer = new McpServer(
    { name: 'Architect MCP Server', version: '1.0.0' },
    { capabilities: { resources: {} } }
  );
  try {
    // Register MCP tools BEFORE connecting
    try {
      listGuildsTool(mcpServer); // Use the same tool name for all instances
      listCategoriesTool(mcpServer);
      listChannelsTool(mcpServer);
      listRolesTool(mcpServer);
      listMembersTool(mcpServer);
      getGuildTool(mcpServer);
      getCategoryTool(mcpServer);
      getChannelTool(mcpServer);
      getRoleTool(mcpServer);
      getMemberTool(mcpServer);
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
