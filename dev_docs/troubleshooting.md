# Troubleshooting

## Common Issues

- **Failed to register commands:** Check `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`.
- **Database connection errors:** Verify MySQL credentials and that DB server is reachable.
- **Redis errors:** Check Redis host, port, and cluster availability.
- **MCP token missing or invalid:** Ensure `MCP_TOKEN` is set and matches the HTTP requests.
- **Permissions issues:** Run bot with correct system user, ensure filesystem permissions.

## Logs
- Logs managed by winston, check console or configured log outputs.

## Debugging
- Use verbose logging with `LOG_LEVEL=debug`.
- Use Discord.js docs for command/event API details.

---
