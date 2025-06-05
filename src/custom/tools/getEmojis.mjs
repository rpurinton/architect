import { z } from 'zod';

// Tool: get-emojis
// Lists all custom emojis in a guild.
export default async function (server, toolName = 'get-emojis') {
  server.tool(
    toolName,
    'List all custom emojis in the guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      const emojis = guild.emojis.cache.map(e => ({
        id: e.id,
        name: e.name,
        animated: e.animated,
        url: e.url,
        available: e.available,
        createdAt: e.createdAt,
        requiresColons: e.requiresColons,
        managed: e.managed,
        roles: e.roles.cache.map(r => r.id),
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(emojis, null, 2) },
        ],
      };
    }
  );
}
