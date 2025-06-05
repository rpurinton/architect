import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

export async function initializeMcpServer() {
  const server = new Server(
    { name: 'Architect MCP Server', version: '1.0.0' },
    { capabilities: { resources: {} } }
  );

  // Define any request handlers here as needed
  // Example: server.setRequestHandler(SomeRequestSchema, handlerFunction)

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('MCP Server initialized');
  return server;
}

// Export default for convenience
export default initializeMcpServer;
