import 'dotenv/config';
import logDefault from '../log.mjs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Refactored: allow dependency injection for testability
export async function initializeMcpClient({
  log = logDefault,
  port = process.env.PORT || 9232,
  baseUrl = `http://localhost:${port}/mcp`,
  ClientClass = Client,
  TransportClass = StreamableHTTPClientTransport,
} = {}) {
  let client;
  let transport;
  const RECONNECT_BASE_DELAY = 1000; // 1s
  const RECONNECT_MAX_DELAY = 60000; // 1min
  let reconnectDelay = RECONNECT_BASE_DELAY;

  async function connectWithRetry() {
    try {
      client = new ClientClass(
        { name: 'Architect MCP Client', version: '1.0.0' },
        { capabilities: { sampling: {} } }
      );
      transport = new TransportClass(baseUrl);
      await client.connect(transport);
      log.info && log.info(`MCP Client initialized connecting to ${baseUrl}`);
      reconnectDelay = RECONNECT_BASE_DELAY;
      // Listen for disconnect/error events if supported
      if (typeof transport.on === 'function') {
        transport.on('close', handleDisconnect);
        transport.on('error', handleDisconnect);
      }
      return client;
    } catch (error) {
      log.error && log.error('Error connecting MCP Client:', error);
      setTimeout(connectWithRetry, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
    }
  }

  function handleDisconnect() {
    log.info && log.info('MCP Client disconnected. Attempting to reconnect...');
    setTimeout(connectWithRetry, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
  }

  await connectWithRetry();
  return client;
}

export default initializeMcpClient;
