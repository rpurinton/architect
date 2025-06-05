# Architect

A Discord.js bot integrated with Model Context Protocol (MCP) server functionality to enable AI-driven Discord server administration and automation.

---

## Overview

Architect combines a modern Discord.js app with an embedded MCP server, exposing powerful tools to automate and manage Discord servers through conversational AI agents. Use natural language commands to build, configure, and update your Discord server structure, roles, permissions, channels, and more with ease.

---

## Features

- **Integrated MCP Server:** Expose Discord server admin functions as MCP resources for AI agents.
- **Discord.js Bot:** Supports locales, events, and slash commands with modular command/event loading.
- **Dynamic Server Management:** Create/edit categories, channels, roles, and permissions programmatically.
- **Audit & Messaging:** Access server audit logs, send messages, and craft rich embed content.
- **Natural Language Automation:** Use AI-driven conversations for bulk updates and server builds.
- **Graceful Shutdown & Error Handling**
- **Configurable Logging with Winston**
- **Production Ready:** Includes systemd service template for Linux deployment.
- **Localization Support:** Easily add or update language files.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rpurinton/architect.git
cd architect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your Discord app credentials and logging preferences:

```env
DISCORD_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-client-id
LOG_LEVEL=info
```

### 4. Run the App

```bash
node architect.mjs
```

---

## Usage

### Adding Commands

- Add JSON command definitions to `src/commands/`.
- Add corresponding handler `.mjs` files with matching names for command logic.

### Adding Event Handlers

- Add `.mjs` files named after Discord events in `src/events/`.
- Export default functions to handle events.

### Localization

- Edit or add JSON locale files in `src/locales/` to support multiple languages.

### MCP Server Extensions

- Define and expose MCP resources and tools in the app to enable AI agents to interact with Discord administration tasks.

---

## Systemd Service Setup

Update `architect.service` for your environment and deploy as a systemd service:

```ini
[Unit]
Description=Architect MCP Discord Bot
After=network-online.target
Wants=network-online.target

[Service]
User=appuser
Group=appgroup
Restart=on-failure
RestartSec=5
WorkingDirectory=/var/opt/architect
ExecStart=/usr/bin/node /var/opt/architect/architect.mjs
EnvironmentFile=/var/opt/architect/.env

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable architect.service
sudo systemctl start architect.service
sudo systemctl status architect.service
```

---

## Best Practices

- Keep your Discord bot token confidential; do not commit `.env` to repositories.
- Run as a non-root user for security.
- Regularly update dependencies and upstream code.
- Write tests for command and event handlers as complexity grows.
- Reference [Discord.js Documentation](https://discord.js.org/) for API updates.

---

## Folder Structure

```text
src/
  commands/       # Discord slash commands (JSON + handlers)
  events/         # Discord event handlers
  locales/        # Localization JSON files
  mcp/            # MCP server definitions & handlers (to be implemented)
```

---

## License

MIT

---

## Developer Support

Email: russell.purinton@gmail.com  
Discord: laozi101
