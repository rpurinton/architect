# Events API Reference

Event handlers live in `src/events/` as `.mjs` files named after Discord event names.
Each exports a default function with parameters matching Discord.js event signatures.

Handlers are automatically loaded and bound to client events in `src/events.mjs`.

Common event names include:
- `messageCreate`
- `interactionCreate`
- `guildMemberAdd`
- `ready`

Refer to [Discord.js documentation](https://discord.js.org/) for details.

---
