# MCP Tools API Reference

MCP tools are `.mjs` modules in `src/custom/tools/`.
Each exports a default async function accepting an MCP Server instance to register tool functionality.

Tools expose functions usable by AI agents via MCP.

See `src/custom/mcpServer.mjs` for initialization and registration of tools.

---
