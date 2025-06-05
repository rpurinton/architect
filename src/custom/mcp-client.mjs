import { Client } from '@modelcontextprotocol/sdk/client';
import { HttpClientTransport } from '@modelcontextprotocol/sdk/client/http';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 9232;
const baseUrl = `http://localhost:${port}`;

export async function initializeMcpClient() {
  const client = new Client(
    { name: 'Architect MCP Client', version: '1.0.0' },
    { capabilities: { sampling: {} } }
  );

  const transport = new HttpClientTransport({ url: baseUrl });
  await client.connect(transport);

  console.log(`MCP Client initialized connecting to ${baseUrl}`);
  return client;
}

export default initializeMcpClient;
