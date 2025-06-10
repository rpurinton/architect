# Architect

Architect is a modular, AI-empowered Discord.js bot designed for automated Discord server administration and management using the Model Context Protocol (MCP).

## Features

- Discord bot with dynamic slash command support and event handling.
- Integrated MCP server exposing Discord admin functions as MCP tools.
- AI-driven natural language automation leveraging OpenAI.
- Localization with multi-language support.
- Robust error handling and graceful shutdown.
- Uses Redis caching and MySQL persistence.
- Secure MCP HTTP interface with bearer token authentication.
- Production-ready with systemd service template.

## Quick Start

1. Clone the repo:

   ```bash
   git clone https://github.com/rpurinton/architect.git
   cd architect
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy and configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env to set tokens, DB, Redis credentials etc.
   cp tools.json.example tools.json
   # Edit tools.json to configure available tools and MCP servers as needed
   ```

4. Run:

   ```bash
   node architect.mjs
   ```

## Configuration

Edit `.env` file to include your Discord bot token, client ID, database credentials, MCP token, and logging preferences.

| Variable         | Description                     | Example             |
|------------------|---------------------------------|---------------------|
| DISCORD_TOKEN    | Discord bot token              | abc123xyz           |
| DISCORD_CLIENT_ID| Discord application client ID  | 123456789           |
| DB_HOST          | MySQL host                    | localhost           |
| DB_USER          | MySQL username                | root                |
| DB_PASS          | MySQL password                | secret              |
| DB_NAME          | MySQL database name           | architect_db         |
| REDIS_HOST       | Redis cluster host            | 127.0.0.1           |
| REDIS_PORT       | Redis port                   | 6379                |
| MCP_TOKEN        | Bearer token for MCP HTTP auth | secret-token         |
| MCP_PORT         | MCP HTTP server port          | 9232                |
| LOG_LEVEL        | Logging level (info, debug)    | info                |

## Configuring Tools and MCP Servers

- The `tools.json` file defines which tools are available to the AI agent, including web search, image generation, and MCP (Model Context Protocol) servers.
- To add or configure MCP servers, edit the `tools` array in `tools.json`. Each entry can specify a different MCP server by setting the `server_label`, `server_url`, and `headers` (such as the Bearer token).
- **Important:** The `server_url` for any MCP server must be a publicly reachable URL accessible by OpenAI's API servers. Using `localhost` or private/internal addresses will not work. Use your server's public/external URL (e.g., `https://<external_url>:9232`).
- Example:

```json
{
    "tools": [
        {
            "type": "mcp",
            "server_label": "discord",
            "server_url": "https://<external_url>",
            "headers": {
                "Authorization": "Bearer <your-mcp-token>"
            },
            "require_approval": "never"
        }
        // Add more MCP servers here as needed
    ]
}
```

- For more details, see `tools.json.example` and the documentation in `docs/tool_pattern.md`.

## Project Structure

```plaintext
/opt/architect
  [39m[0m[39m  [0m[39m[0m[39m├── architect.mjs          # Main app entry point[0m
  [39m  [0m[39m  [0m[39m[0m[39m├── src/[0m
  [39m  [0m[39m  [0m[39m[0m[39m│   [0m[39m[0m[39m├── commands/          # JSON command definitions and handlers[0m
  [39m  [0m[39m  [0m[39m[0m[39m│   [0m[39m[0m[39m├── events/            # Event handlers for Discord.js[0m
  [39m  [0m[39m  [0m[39m[0m[39m│   [0m[39m[0m[39m├── custom/            # MCP server, client, and tools[0m
  [39m  [0m[39m  [0m[39m[0m[39m│   [0m[39m[0m[39m├── locales/           # Localization JSON[0m
  [39m  [0m[39m  [0m[39m[0m[39m│   [0m[39m[0m[39m├── log.mjs            # Logger setup[0m
  [39m  [0m[39m  [0m[39m[0m[39m├── exceptions.mjs     # Global exception handlers[0m
  [39m  [0m[39m  [0m[39m[0m[39m├── shutdown.mjs       # Graceful shutdown handling[0m
  [39m  [0m[39m  [0m[39m[0m[39m└── discord.mjs        # Discord client creation[0m
[39m  [0m[39m[0m[0m[39m[0m[39m[0m[39m[0m[39m  [0m
.env                   # Environment variables
architect.service      # systemd service file
└── docs/              # Developer documentation
```

## Development

- See `docs/` for detailed developer documentation.
- Use `npm test` to run tests.
- Write new commands in `src/commands/`.
- Add event handlers in `src/events/`.
- Add MCP tools in `src/custom/tools/`.

## Deployment

- Use the included systemd service for running as a service.
- Ensure `.env` is correctly configured with all credentials.

## Troubleshooting

- Check logs for details, increase `LOG_LEVEL` for debug.
- Validate Discord bot permissions.
- Check connectivity to database and Redis.

## Support & Resources

- Join our [Support Discord Server](https://discord.gg/Mgnaezufwc)
- Visit our [GitHub Project Repository](https://github.com/rpurinton/architect)

## License

MIT License

## Contact

Russell Purinton at <russell.purinton@gmail.com>

---

Please see `docs/` for comprehensive documentation and contribution guidelines.
