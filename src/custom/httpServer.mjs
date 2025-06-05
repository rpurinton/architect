import 'dotenv/config';
import express from 'express';
import http from 'http';
import crypto from 'crypto';
import log from '../log.mjs';
import { v4 as uuidv4 } from 'uuid';

// Track all active MCP servers for multi-client support
// sessionId -> { mcpServer, mcpTransport, lastActive }
const activeMcpServers = new Map();
const MCP_SESSION_TIMEOUT_MS = 3600 * 1000; // 1 hour

// Periodically clean up inactive sessions
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeMcpServers.entries()) {
    if (now - (session.lastActive || 0) > MCP_SESSION_TIMEOUT_MS) {
      if (session.mcpServer && typeof session.mcpServer.close === 'function') {
        session.mcpServer.close().catch(() => {});
      }
      activeMcpServers.delete(sessionId);
      log.info(`MCP session ${sessionId} timed out and was cleaned up.`);
    }
  }
}, 60 * 1000); // check every minute

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
  log.debug(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
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
    log.debug(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
    res.end = oldEnd;
    return oldEnd.call(this, chunk, ...args);
  };

  next();
});

// Helper to create a new MCP server for a session
async function createSessionMcpServer(sessionId, req, res, body) {
  const { default: initializeMcpServer } = await import('./mcpServer.mjs');
  const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
  const mcpTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => sessionId,
  });
  const mcpServer = await initializeMcpServer(mcpTransport);
  activeMcpServers.set(sessionId, { mcpServer, mcpTransport, lastActive: Date.now() });
  return { mcpServer, mcpTransport };
}

// Multi-client /mcp POST handler
app.post('/mcp', async (req, res) => {
  // Use a sessionId from header or generate a new one
  let sessionId = req.headers['x-mcp-session'] || uuidv4();
  res.setHeader('x-mcp-session', sessionId);
  let session = activeMcpServers.get(sessionId);
  if (!session) {
    try {
      session = await createSessionMcpServer(sessionId, req, res, req.body);
    } catch (err) {
      log.error('Error creating MCP server for session:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal MCP server error', details: err && err.stack ? err.stack : String(err) });
      }
      return;
    }
  }
  // Update last activity timestamp
  session.lastActive = Date.now();
  try {
    await session.mcpTransport.handleRequest(req, res, req.body);
  } catch (err) {
    log.error('Error handling /mcp POST request:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal MCP server error', details: err && err.stack ? err.stack : String(err) });
    }
  }
});

export { activeMcpServers };

export default async function initializeHttpServer() {
  // No single mcpServer initialization needed for multi-client mode
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

  return { app, serverInstance };
}
