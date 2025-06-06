import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'fs';
import path from 'path';
import { getCurrentFilename } from '../esm-filename.mjs';

let _mcpServerInstance = null;
let _mcpServerInitPromise = null;

// Refactored: allow dependency injection for testability
export default function initializeMcpServer(
  mcpTransport,
  meta = import.meta,
  toolsDirOverride,
  { log: injLog, fsModule = fs, pathModule = path, getCurrentFilenameFn = getCurrentFilename, importFn = (path) => import(path) } = {}
) {
  if (_mcpServerInitPromise) {
    return _mcpServerInitPromise;
  }
  _mcpServerInitPromise = (async () => {
    // If no logger is injected, dynamically import the default logger
    if (!injLog) {
      injLog = (await import('../log.mjs')).default;
    }
    const __filename = getCurrentFilenameFn(meta);
    const __dirname = pathModule.dirname(__filename);
    const toolsDir = toolsDirOverride || pathModule.join(__dirname, 'tools');
    const mcpServer = new McpServer(
      { name: 'Architect MCP Server', version: '1.0.0' },
      { capabilities: { resources: {} } }
    );
    try {
      try {
        // Dynamically load all tool modules in ./tools
        const toolFiles = fsModule.readdirSync(toolsDir).filter(f => f.endsWith('.mjs'));
        for (const file of toolFiles) {
          try {
            const mod = await importFn(pathModule.join(toolsDir, file));
            if (typeof mod.default === 'function') {
              await mod.default(mcpServer);
              injLog.debug(`Registered MCP tool from ${file}`);
            } else {
              injLog.warn(`No default export function in ${file}`);
            }
          } catch (toolErr) {
            injLog.error(`Error registering MCP tool from ${file}:`, toolErr);
          }
        }
        injLog.info('Registered all MCP tools');
      } catch (toolErr) {
        injLog.error('Error registering MCP tools:', toolErr);
      }
      await mcpServer.connect(mcpTransport);
      injLog.info('MCP Server connected');
    } catch (err) {
      injLog.error('MCP Server connection error:', err && err.stack ? err.stack : err);
      throw err;
    }
    _mcpServerInstance = mcpServer;
    return _mcpServerInstance;
  })();
  return _mcpServerInitPromise;
}
