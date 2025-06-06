# MCP Protocol Integration

## MCP Server
- Embedded in Architect, initialized in `src/custom/mcpServer.mjs`.
- Loads tools dynamically from `src/custom/tools/`.
- Connects via StreamableHTTPServerTransport on configured port.

## MCP HTTP Server
- Express server in `src/custom/httpServer.mjs`.
- Secured by bearer token (`MCP_TOKEN`).
- Routes POST requests to MCP server transport handler.

## MCP Client
- Optional client in `src/custom/mcpClient.mjs` connects to MCP server.
- Supports reconnect logic.

## Tools
- Tools expose Discord server admin functionality.
- Designed for AI-driven automation via MCP interactions.

---
