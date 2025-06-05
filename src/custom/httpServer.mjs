import 'dotenv/config';
import express from 'express';
import http from 'http';
import crypto from 'crypto';
import log from '../log.mjs';
import initializeMcpServer from './mcpServer.mjs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

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
  if (req.method === 'GET') {
    log.debug(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
  } else if (req.method === 'POST') {
    log.info(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
  } else {
    log.debug(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
  }
  next();
});

// Log all HTTP responses with status and body (robust, works for res.send, res.end, and streams)
app.use((req, res, next) => {
  const oldSend = res.send;
  const oldEnd = res.end;
  const oldWrite = res.write;
  let chunks = [];

  res.send = function (body) {
    if (body) chunks.push(Buffer.isBuffer(body) ? body : Buffer.from(body));
    res.send = oldSend;
    return res.send(body);
  };

  res.write = function (chunk, ...args) {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return oldWrite.call(this, chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const bodyText = chunks.length ? Buffer.concat(chunks).toString('utf8') : '';
    if (req.method === 'GET') {
      log.debug(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
    } else if (req.method === 'POST') {
      log.info(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
    } else {
      log.debug(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
    }
    res.end = oldEnd;
    return oldEnd.call(this, chunk, ...args);
  };

  next();
});

// Create a single MCP server and transport for all clients
const mcpTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});
let mcpServer;
(async () => {
  mcpServer = await initializeMcpServer(mcpTransport);
})();

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
