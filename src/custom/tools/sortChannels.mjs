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
      let channels = guild.channels.cache;
      let siblings;
      if (parentId) {
        siblings = channels.filter(c => c.parentId === parentId && c.type !== 4);
      } else {
        siblings = channels.filter(c => c.parentId === null && c.type !== 4);
      }
      // Validate all provided IDs exist and are in the filtered set
      for (const id of channelIds) {
        if (!siblings.has(id)) throw new Error(`Channel ID not found in scope: ${id}`);
      }
      // Prepare new order: sorted channelIds first, then the rest in their current order
      const sorted = [];
      let position = 0;
      for (const id of channelIds) {
        sorted.push({ id, position: position++ });
      }
      siblings.filter(ch => !channelIds.includes(ch.id))
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .forEach(ch => {
          sorted.push({ id: ch.id, position: position++ });
        });
      await guild.channels.setPositions(sorted);
      return {
        content: [
          { type: 'text', text: `Sorted ${channelIds.length} channels${parentId ? ` in category ${parentId}` : ''} for guild ${guildId}.` },
        ],
      };
    }
  );
}
