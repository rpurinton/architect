import 'dotenv/config';
import log from '../log.mjs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'fs';
import path from 'path';
import { getCurrentFilename } from '../esm-filename.mjs';

export default async function initializeMcpServer(mcpTransport, meta = import.meta, toolsDirOverride) {
  const __filename = getCurrentFilename(meta);
  const __dirname = path.dirname(__filename);
  const toolsDir = toolsDirOverride || path.join(__dirname, 'tools');
  const mcpServer = new McpServer(
    { name: 'Architect MCP Server', version: '1.0.0' },
    { capabilities: { resources: {} } }
  );
  try {
    try {
      // Dynamically load all tool modules in ./tools
      const toolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.mjs'));
      for (const file of toolFiles) {
        try {
          const mod = await import(path.join(toolsDir, file));
          if (typeof mod.default === 'function') {
            await mod.default(mcpServer);
            log.debug(`Registered MCP tool from ${file}`);
          } else {
            log.warn(`No default export function in ${file}`);
          }
        } catch (toolErr) {
          log.error(`Error registering MCP tool from ${file}:`, toolErr);
        }
      }
      log.info('Registered all MCP tools');
    } catch (toolErr) {
      log.error('Error registering MCP tools:', toolErr);
    }
    await mcpServer.connect(mcpTransport);
    log.info('MCP Server connected');
  } catch (err) {
    log.error('MCP Server connection error:', err && err.stack ? err.stack : err);
    throw err;
  }
  return mcpServer;
}
