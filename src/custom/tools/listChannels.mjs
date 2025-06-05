import { z } from 'zod';

const listChannelsRequestSchema = z.object({ guildId: z.string() });
const listChannelsResponseSchema = z.object({
  channels: z.array(z.object({ id: z.string(), name: z.string(), type: z.string() })),
});

export function listChannelsTool(server, toolName = 'list-channels') {
  server.tool(
    toolName,
    'Returns a list of channels in a guild.',
    { guildId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      console.log('Full args:', args);
      console.log('Requested guildId:', guildId, 'Type:', typeof guildId);
      const availableGuilds = Array.from(global.client.guilds.cache.keys());
      console.log('Available guild IDs:', availableGuilds);
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Provided: ${guildId}. Available: ${availableGuilds.join(', ')}`);
      // Sort channels by rawPosition to match Discord sidebar order
      const sortedChannels = guild.channels.cache.sort((a, b) => a.rawPosition - b.rawPosition);
      const channels = sortedChannels.map(ch => ({
        id: ch.id,
        name: ch.name,
        type: ch.type?.toString() || String(ch.type),
      }));
      const response = listChannelsResponseSchema.parse({ channels });
      // Build a nested structure: channels under their category, uncategorized at the top
      const allChannels = Array.from(guild.channels.cache.values());
      // Sort by rawPosition for sidebar order
      allChannels.sort((a, b) => a.rawPosition - b.rawPosition);

      // Separate categories and other channels
      const categories = allChannels.filter(ch => ch.type === 4); // 4 = GUILD_CATEGORY
      const otherChannels = allChannels.filter(ch => ch.type !== 4);

      // Map categoryId to category object
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = {
          id: cat.id,
          name: cat.name,
          type: cat.type?.toString() || String(cat.type),
          position: cat.rawPosition,
          channels: []
        };
      });

      // Channels with no parent category
      const uncategorized = [];
      otherChannels.forEach(ch => {
        if (ch.parentId && categoryMap[ch.parentId]) {
          categoryMap[ch.parentId].channels.push({
            id: ch.id,
            name: ch.name,
            type: ch.type?.toString() || String(ch.type),
            position: ch.rawPosition
          });
        } else {
          uncategorized.push({
            id: ch.id,
            name: ch.name,
            type: ch.type?.toString() || String(ch.type),
            position: ch.rawPosition
          });
        }
      });

      // Build the final nested result: uncategorized first, then categories in sidebar order
      const nested = [
        ...uncategorized,
        ...categories.map(cat => categoryMap[cat.id])
      ];

      return {
        content: [
          { type: 'text', text: JSON.stringify(nested, null, 2) },
        ],
      };
    }
  );
}

export default listChannelsTool;
