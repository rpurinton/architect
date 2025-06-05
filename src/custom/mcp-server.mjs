import 'dotenv/config';
import log from '../log.mjs';
import express from 'express';
import http from 'http';
import crypto from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import getGuildsTool from './tools/getGuilds.mjs';

const port = process.env.PORT || 9232;

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
  try {
    await mcpTransport.handleRequest(req, res, req.body);
  } catch (err) {
    log.error('Error handling /mcp POST request:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal MCP server error', details: err && err.stack ? err.stack : String(err) });
    }
  }
});

export async function initializeMcpServer() {
  try {
    await mcpServer.connect(mcpTransport);
    log.info('MCP Server connected');

    // Register MCP tools
    try {
      getGuildsTool(mcpServer);
      log.info('Registered MCP tools');
    } catch (toolErr) {
      log.error('Error registering MCP tools:', toolErr);
    }
  } catch (err) {
    log.error('MCP Server connection error:', err && err.stack ? err.stack : err);
    throw err;
  }

  const serverInstance = http.createServer(app);
  serverInstance.on('error', (err) => {
    log.error('HTTP server error:', err && err.stack ? err.stack : err);
  });
  serverInstance.listen(port, () => {
    log.info(`MCP HTTP Server listening on port ${port}`);
  });

  return mcpServer;
}

export default initializeMcpServer;
