import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 9232;
const baseUrl = `http://localhost:${port}`;

export async function initializeMcpClient() {
  console.log('MCP Client baseUrl:', baseUrl);

  const client = new Client(
    { name: 'Architect MCP Client', version: '1.0.0' },
    { capabilities: { sampling: {} } }
  );

  const transport = new StreamableHTTPClientTransport(baseUrl);
  await client.connect(transport);

  console.log(`MCP Client initialized connecting to ${baseUrl}`);
  return client;
}

export default initializeMcpClient;
