import 'dotenv/config';
import express from 'express';
import http from 'http';
import crypto from 'crypto';
import log from '../log.mjs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import initializeMcpServer from './mcpServer.mjs';

const port = process.env.PORT || 9232;

const app = express();
app.use(express.json());

// Log all HTTP requests with body
app.use((req, res, next) => {
  let bodyText = '';
  try {
    bodyText = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : '';
  } catch (e) {
    bodyText = '[unserializable body]';
  }
  log.info(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
  next();
});

// Log all HTTP responses with status and body
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (body) {
    res.send = oldSend; // restore original
    const status = res.statusCode;
    let bodyText = '';
    try {
      bodyText = typeof body === 'object' ? JSON.stringify(body) : String(body);
    } catch {
      bodyText = '[unserializable body]';
    }
    log.info(`[HTTP RES] ${req.method} ${req.url} -> ${status} body=${bodyText}`);
    return oldSend.call(this, body);
  };
  next();
});

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

export default async function initializeHttpServer() {
  let mcpServer;
  try {
    mcpServer = await initializeMcpServer(mcpTransport);
  } catch (err) {
    log.error('MCP Server connection error:', err && err.stack ? err.stack : err);
    throw err;
  }

  let serverInstance;
  try {
    serverInstance = http.createServer(app);
    serverInstance.on('error', (err) => {
      log.error('HTTP server error:', err && err.stack ? err.stack : err);
    });
    serverInstance.listen(port, () => {
      log.info(`MCP HTTP Server listening on port ${port}`);
    });
  } catch (err) {
    log.error('Error starting HTTP server:', err && err.stack ? err.stack : err);
    throw err;
  }

  return { app, serverInstance, mcpServer };
}
