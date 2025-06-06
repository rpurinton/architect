# Development Guide

## Adding Commands
- Define commands as JSON in `src/commands/`.
- Add corresponding `.mjs` handler files in the same directory.
- Handlers export a default function to process the command.

## Event Handlers
- Add `.mjs` files in `src/events/` named after Discord event names.
- Export default function to handle events.

## Localization
- Edit or add JSON files in `src/locales/`.

## MCP Server Tools
- Add or modify tools in `src/custom/tools/` as .mjs modules exporting default functions taking MCP server parameter.

## Testing
- Tests use Jest in devDependencies.
- Run tests using `npm test`.

## Logging
- Uses winston logger, configured in `src/log.mjs`.

## Exception & Shutdown Handling
- Global exception handling in `src/exceptions.mjs`.
- Graceful shutdown in `src/shutdown.mjs`.

---
