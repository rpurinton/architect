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
      // Get all category channels
      const categories = guild.channels.cache.filter(c => c.type === 4);
      // Validate all provided IDs exist and are categories
      for (const id of categoryIds) {
        if (!categories.has(id)) throw new Error(`Category ID not found in guild: ${id}`);
      }
      // Prepare new positions for all categories
      let position = 0;
      const updates = [];
      // Add the categories in the requested order
      for (const id of categoryIds) {
        updates.push({ id, position: position++ });
      }
      // Add any remaining categories in their current order
      categories.filter(c => !categoryIds.includes(c.id))
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .forEach(c => {
          updates.push({ id: c.id, position: position++ });
        });
      // Only update category channels
      await guild.channels.setPositions(updates);
      return {
        content: [
          { type: 'text', text: `Sorted ${categoryIds.length} categories for guild ${guildId}.` },
        ],
      };
    }
  );
}
