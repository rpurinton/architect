import { Server } from '@modelcontextprotocol/sdk/server';
import { HttpServerTransport } from '@modelcontextprotocol/sdk/server/http';
import dotenv from 'dotenv';

dotenv.config();

const port = 9232;

export async function initializeMcpServer() {
  const server = new Server(
    { name: 'Architect MCP Server', version: '1.0.0' },
    { capabilities: { resources: {} } }
  );

  // Define any request handlers here as needed
  // Example: server.setRequestHandler(SomeRequestSchema, handlerFunction)

  const transport = new HttpServerTransport({ port });
  await server.connect(transport);

  console.log(`MCP Server initialized on port ${port}`);
  return server;
}

export default initializeMcpServer;
