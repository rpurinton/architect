import 'dotenv/config';
import log from '../log.mjs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const port = process.env.PORT || 9232;
const baseUrl = `http://localhost:${port}/mcp`;

const RECONNECT_BASE_DELAY = 1000; // 1s
const RECONNECT_MAX_DELAY = 60000; // 1min

export async function initializeMcpClient() {
  let client;
  let transport;
  let reconnectDelay = RECONNECT_BASE_DELAY;

  async function connectWithRetry() {
    try {
      client = new Client(
        { name: 'Architect MCP Client', version: '1.0.0' },
        { capabilities: { sampling: {} } }
      );
      transport = new StreamableHTTPClientTransport(baseUrl);
      await client.connect(transport);
      log.info(`MCP Client initialized connecting to ${baseUrl}`);
      reconnectDelay = RECONNECT_BASE_DELAY;
      // Listen for disconnect/error events if supported
      if (typeof transport.on === 'function') {
        transport.on('close', handleDisconnect);
        transport.on('error', handleDisconnect);
      }
      return client;
    } catch (error) {
      log.error('Error connecting MCP Client:', error);
      setTimeout(connectWithRetry, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
    }
  }

  function handleDisconnect() {
    log.info('MCP Client disconnected. Attempting to reconnect...');
    setTimeout(connectWithRetry, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
  }

  await connectWithRetry();
  return client;
}

export default initializeMcpClient;
