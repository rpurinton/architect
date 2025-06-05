import express from 'express';
import http from 'http';
import crypto from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import dotenv from 'dotenv';
import getGuildsTool from './mcp-tools/getGuilds.mjs';

dotenv.config();

const port = process.env.PORT || 9232;

let discordClient = null;

const app = express();
app.use(express.json());

const mcpServer = new McpServer(
  { name: 'Architect MCP Server', version: '1.0.0' },
  { capabilities: { resources: {} } }
);

const mcpTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});

app.get('/mcp', (req, res) => {
  res.status(200).send('GET /mcp endpoint - no action');
});

app.post('/mcp', async (req, res) => {
  await mcpTransport.handleRequest(req, res, req.body);
});

export async function initializeMcpServer(client) {
  discordClient = client;

  try {
    await mcpServer.connect(mcpTransport);
    console.log('MCP Server connected');

    // Register MCP tools
    getGuildsTool(mcpServer);
    console.log('Registered MCP tools');
  } catch (err) {
    console.error('MCP Server connection error:', err);
  }

  const serverInstance = http.createServer(app);
  serverInstance.listen(port, () => {
    console.log(`MCP HTTP Server listening on port ${port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Received shutdown signal, closing HTTP server...');
    serverInstance.close(() => {
      console.log('HTTP server closed. Exiting process.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Force exiting after 10s.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return mcpServer;
}

export function getDiscordClient() {
  return discordClient;
}

export default initializeMcpServer;
