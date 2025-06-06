import { z } from 'zod';

export default async function (server, toolName = 'discord-sort-channels') {
  server.tool(
    toolName,
    'Sorts channels in a guild or category according to the provided list of channel IDs. All positions are updated in a single batch.',
    {
      guildId: z.string().describe('The ID of the guild.'),
      channelIds: z.array(z.string()).describe('The desired order of channel IDs (top to bottom).'),
      parentId: z.string().optional().describe('If provided, only sort channels within this category.'),
    },
    async ({ guildId, channelIds, parentId }, _extra) => {
      const guild = await global.client.guilds.fetch(guildId);
      if (!guild) throw new Error('Guild not found');
      // Filter channels by parent if specified
      let channels = guild.channels.cache;
      if (parentId) {
        channels = channels.filter(c => c.parentId === parentId);
      }
      // Validate all provided IDs exist and are in the filtered set
      for (const id of channelIds) {
        if (!channels.has(id)) throw new Error(`Channel ID not found in scope: ${id}`);
      }
      // Prepare position updates
      const updates = channelIds.map((id, i) => ({ id, position: i }));
      // Bulk update
      await guild.channels.setPositions(updates);
      return {
        content: [
          { type: 'text', text: `Sorted ${channelIds.length} channels${parentId ? ` in category ${parentId}` : ''} for guild ${guildId}.` },
        ],
      };
    }
  );
}
