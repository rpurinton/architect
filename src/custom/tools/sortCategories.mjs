import { z } from 'zod';

export default async function (server, toolName = 'discord-sort-categories') {
  server.tool(
    toolName,
    'Sorts categories in a guild according to the provided list of category channel IDs. All positions are updated in a single batch.',
    {
      guildId: z.string().describe('The ID of the guild.'),
      categoryIds: z.array(z.string()).describe('The desired order of category channel IDs (top to bottom).'),
    },
    async ({ guildId, categoryIds }, _extra) => {
      const guild = await global.client.guilds.fetch(guildId);
      if (!guild) throw new Error('Guild not found');
      // Get all channels
      const allChannels = guild.channels.cache;
      // Filter only category channels
      const categories = allChannels.filter(c => c.type === 4);
      // Validate all provided IDs exist and are categories
      for (const id of categoryIds) {
        if (!categories.has(id)) throw new Error(`Category ID not found in guild: ${id}`);
      }
      // Prepare new positions for all channels
      // First, get all categories in their current order
      const otherChannels = allChannels.filter(c => c.type !== 4);
      // Build the new order: categories in the order of categoryIds, then all other channels in their current order
      let position = 0;
      const updates = [];
      for (const id of categoryIds) {
        updates.push({ id, position: position++ });
      }
      // Add all other channels, keeping their current order after the categories
      otherChannels.sort((a, b) => a.rawPosition - b.rawPosition).forEach(ch => {
        updates.push({ id: ch.id, position: position++ });
      });
      // Bulk update
      await guild.channels.setPositions(updates);
      return {
        content: [
          { type: 'text', text: `Sorted ${categoryIds.length} categories for guild ${guildId}.` },
        ],
      };
    }
  );
}
