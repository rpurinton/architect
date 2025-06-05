import 'dotenv/config';
import log from '../log.mjs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const port = process.env.PORT || 9232;
const baseUrl = `http://localhost:${port}/mcp`;

export async function initializeMcpClient() {
  try {
    const client = new Client(
      { name: 'Architect MCP Client', version: '1.0.0' },
      { capabilities: { sampling: {} } }
    );

    const transport = new StreamableHTTPClientTransport(baseUrl);
    try {
      await client.connect(transport);
    } catch (connectErr) {
      log.error('Error connecting MCP Client:', connectErr);
      throw connectErr;
    }

    log.info(`MCP Client initialized connecting to ${baseUrl}`);
    return client;
  } catch (error) {
    log.error('Error initializing MCP Client:', error);
    throw error; // rethrow so caller can handle if needed
  }
}

export default initializeMcpClient;
