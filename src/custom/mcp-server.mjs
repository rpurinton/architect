import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 9232;
const host = '0.0.0.0';

export async function initializeMcpServer() {
  const server = new McpServer(
    { name: 'Architect MCP Server', version: '1.0.0' },
    { capabilities: { resources: {} } }
  );

  const transport = new StreamableHTTPServerTransport({
    port: port,
    host: host
  });

  await server.connect(transport);

  console.log(`MCP Server initialized on ${host}:${port}`);
  return server;
}

export default initializeMcpServer;
