# Architect User Guide

## Introduction
Architect is a powerful Discord.js bot integrated with an AI-driven MCP (Model Context Protocol) server for advanced Discord server automation and management through natural language commands.

## Getting Started

### Prerequisites
- Node.js 18 or later
- MySQL server
- Redis cluster
- Discord application with bot token

### Installation
1. Clone the repository:
```bash
git clone https://github.com/rpurinton/architect.git
cd architect
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Copy `.env.example` to `.env` and update values:
```env
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-client-id
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
MCP_TOKEN=your-mcp-token
MCP_PORT=9232
LOG_LEVEL=info
```

4. Optionally set up systemd service using `architect.service` file.

### Running
Start application:
```bash
node architect.mjs
```
Or via systemd service:
```bash
sudo systemctl start architect.service
```

## Using Architect

### Discord Commands
- Commands are registered as slash commands.
- Use Discord client to invoke commands.
- Command logic is in handlers under `src/commands/`.

### Localization
- Supports multiple locales in `src/locales/`.
- Add or edit JSON files to customize or add language support.

### MCP Server
- Embedded MCP server listens on configured HTTP port.
- Secured with bearer token (`MCP_TOKEN`).
- Supports AI-driven server management tools.

## Extending Architect

### Adding Commands
- Add command JSON in `src/commands/`.
- Add corresponding `.mjs` handler exporting default function.

### Adding Event Handlers
- Add `.mjs` file to `src/events/` named after Discord event.
- Export default handler function.

### Adding MCP Tools
- Add tool `.mjs` files in `src/custom/tools/`.
- Each exports a function accepting MCP server instance to register.

## Troubleshooting

- Check logs for errors, logging configured via winston.
- Common issues include missing environment variables, invalid tokens, or database connectivity.
- Use `LOG_LEVEL=debug` for more verbose output.

## Support

For assistance contact:
Russell Purinton <russell.purinton@gmail.com>

## License

MIT License

---
This guide offers a comprehensive overview for users to set up, run, and extend Architect Discord bot with MCP AI integration.
