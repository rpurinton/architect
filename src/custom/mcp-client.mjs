import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 9232;
const baseUrl = `http://localhost:${port}/mcp`;

export async function initializeMcpClient() {
  console.log('MCP Client baseUrl:', baseUrl);

  try {
    const client = new Client(
      { name: 'Architect MCP Client', version: '1.0.0' },
      { capabilities: { sampling: {} } }
    );

    const transport = new StreamableHTTPClientTransport(baseUrl);
    await client.connect(transport);

    console.log(`MCP Client initialized connecting to ${baseUrl}`);
    return client;
  } catch (error) {
    console.error('Error initializing MCP Client:', error);
    throw error; // rethrow so caller can handle if needed
  }
}

export default initializeMcpClient;
