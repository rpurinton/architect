# Commands API Reference

Commands are defined in JSON files in `src/commands/` with name, description, options.
Handlers are `.mjs` files exporting an async default function.

Example command JSON schema:
```json
{
  "name": "example",
  "description": "Example command",
  "options": []
}
```

Handlers receive interaction object to respond.

See `loadAndRegisterCommands` in `src/commands.mjs` for command loading logic.

---
