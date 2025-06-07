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
