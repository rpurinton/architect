import { z } from 'zod';

// Tool: delete-category
// Deletes a category channel from a guild (optionally with its child channels).
export default async function (server, toolName = 'discord-delete-category') {
  server.tool(
    toolName,
    'Remove a category and optionally its child channels.',
    {
      guildId: z.string(),
      categoryId: z.string(),
      deleteChildren: z.boolean().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, categoryId, deleteChildren, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const category = guild.channels.cache.get(categoryId);
      if (!category || category.type !== 4) throw new Error('Category not found or is not a category channel.');
      if (deleteChildren) {
        // Delete all child channels first
        const children = guild.channels.cache.filter(ch => ch.parentId === categoryId);
        for (const ch of children.values()) {
          try {
            await ch.delete(reason || 'Deleted with parent category');
          } catch (err) {
            // Continue deleting others, but log error
          }
        }
      }
      try {
        await category.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete category: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, deletedCategoryId: categoryId }, null, 2) },
        ],
      };
    }
  );
}
