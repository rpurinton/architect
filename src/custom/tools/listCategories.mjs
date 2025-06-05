import { z } from 'zod';

// Tool: list-categories
// Lists all category channels in a guild.
export default async function (server, toolName = 'list-categories') {
  server.tool(
    toolName,
    'List all category channels in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const categories = Array.from(guild.channels.cache.values())
        .filter(ch => ch.type === 4) // 4 = GUILD_CATEGORY
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          position: cat.rawPosition,
          permissionOverwrites: cat.permissionOverwrites?.cache?.map(po => ({
            id: po.id,
            type: po.type,
            allow: po.allow?.toArray?.() || [],
            deny: po.deny?.toArray?.() || [],
          })) || [],
        }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(categories, null, 2) },
        ],
      };
    }
  );
}
