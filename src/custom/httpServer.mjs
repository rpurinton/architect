import 'dotenv/config';
import express from 'express';
import http from 'http';
import crypto from 'crypto';
import initializeMcpServer from './mcpServer.mjs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export function createHttpServer({
  log,
  port = process.env.MCP_PORT || 9232,
  mcpServer,
  mcpTransport,
  initializeMcpServerFn = initializeMcpServer,
  StreamableHTTPServerTransportClass = StreamableHTTPServerTransport,
  sessionIdGenerator = () => crypto.randomUUID(),
  autoStartMcpServer = false,
} = {}) {
  const injLog = log || { debug: () => { }, info: () => { }, error: () => { } };
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.url === '/') {
      return next();
    }
    let bodyText = '';
    try {
      bodyText = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : '';
    } catch (e) {
      bodyText = '[unserializable body]';
    }
    if (injLog) {
      if (req.method === 'GET') {
        injLog.debug(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
      } else if (req.method === 'POST') {
        injLog.info(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
      } else {
        injLog.debug(`[HTTP] ${req.method} ${req.url} from ${req.ip} body=${bodyText}`);
      }
    }
    next();
  });

  app.use((req, res, next) => {
    if (req.method === 'GET' && req.url === '/') {
      return next();
    }
    const oldSend = res.send;
    const oldEnd = res.end;
    const oldWrite = res.write;
    let chunks = [];

    res.send = function (body) {
      if (body) chunks.push(Buffer.isBuffer(body) ? body : Buffer.from(body));
      res.send = oldSend;
      return oldSend.call(this, body);
    };

    res.write = function (chunk, ...args) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return oldWrite.call(this, chunk, ...args);
    };

    res.end = function (chunk, ...args) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const bodyText = chunks.length ? Buffer.concat(chunks).toString('utf8') : '';
      if (injLog) {
        if (req.method === 'GET') {
          injLog.debug(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
        } else if (req.method === 'POST') {
          injLog.debug(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
        } else {
          injLog.debug(`[HTTP RES] ${req.method} ${req.url} -> ${res.statusCode} body=${bodyText}`);
        }
      }
      res.end = oldEnd;
      return oldEnd.call(this, chunk, ...args);
    };

    next();
  });

  app.use((req, res, next) => {
    if (req.method === 'POST' && req.url === '/') {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      const expected = process.env.MCP_TOKEN;
      if (!expected) {
        return res.status(500).json({ error: 'MCP_TOKEN not set in environment' });
      }
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
      }
      const token = authHeader.slice('Bearer '.length).trim();
      if (token !== expected) {
        return res.status(401).json({ error: 'Invalid bearer token' });
      }
    }
    next();
  });

  const transport = mcpTransport;
  const server = mcpServer;

  app.get('/', (req, res) => {
    res.status(200).send('GET / endpoint - no action');
  });

  app.post('/', async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      if (injLog) injLog.error('Error handling / POST request:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal MCP server error', details: err && err.stack ? err.stack : String(err) });
      }
    }
  });

  const httpInstance = http.createServer(app);
  httpInstance.on('error', (err) => {
    injLog.error('HTTP server error:', err && err.stack ? err.stack : err);
  });

  return { app, httpInstance, transport, server };
}

import log from '../log.mjs';
export default async function initializeHttpServer() {
  const transport = new StreamableHTTPServerTransport({});
  const mcpServer = await initializeMcpServer(transport);
  const { app, httpInstance } = createHttpServer({ log, mcpServer, mcpTransport: transport, autoStartMcpServer: false });
  const port = process.env.MCP_PORT || 9232;
  httpInstance.listen(port, () => {
    log.info(`MCP HTTP Server listening on port ${port}`);
  });
  return { app, httpInstance, mcpServer };
}
