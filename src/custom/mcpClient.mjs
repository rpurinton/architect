import 'dotenv/config';
import logDefault from '../log.mjs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import fs from 'fs';
import path from 'path';

export async function initializeMcpClient({
  log = logDefault,
  port = process.env.MCP_PORT || 9232,
  baseUrl = `http://localhost:${port}/`,
  token = process.env.MCP_TOKEN,
  ClientClass = Client,
  TransportClass = StreamableHTTPClientTransport,
} = {}) {
  let client;
  let transport;
  const RECONNECT_BASE_DELAY = 1000; // 1s
  const RECONNECT_MAX_DELAY = 60000; // 1min
  let reconnectDelay = RECONNECT_BASE_DELAY;

  // Get version from package.json
  let version = '1.0.0';
  try {
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version || version;
  } catch (err) {
    log.warn && log.warn('Could not read package.json for version:', err && err.stack ? err.stack : err);
  }

  async function connectWithRetry() {
    try {
      client = new ClientClass(
        { name: 'Architect MCP Client', version },
        { capabilities: { sampling: {} } }
      );
      const transportOptions = {};
      if (token) {
        transportOptions.defaultHeaders = {
          Authorization: `Bearer ${token}`
        };
        log.info && log.info(`[DEBUG] Using MCP_TOKEN for Authorization header (defaultHeaders)`);
      } else {
        log.error && log.error('No MCP_TOKEN provided for MCP client authentication.');
        throw new Error('Missing MCP_TOKEN for MCP client authentication.');
      }
      transport = new TransportClass(baseUrl, transportOptions);
      await client.connect(transport);
      log.info && log.info(`MCP Client connected to ${baseUrl}`);
      reconnectDelay = RECONNECT_BASE_DELAY;
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
