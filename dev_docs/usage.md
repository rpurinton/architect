# Usage Guide

## Running The App
- Start using `node architect.mjs` or systemd service.
- The bot connects to Discord and MCP HTTP server is available on MCP_PORT.

## Command Usage
- Commands are slash commands registered with Discord.
- Use Discord client to invoke commands.

## Localization
- Locales are loaded from `src/locales/`.
- Add or edit JSON files for translations.

## Extending
- Add new commands in `src/commands/` with JSON and handler `.mjs`.
- Add event handlers in `src/events/` as `.mjs` files exporting default functions.

---
