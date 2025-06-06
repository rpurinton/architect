import { z } from 'zod';

// Tool: update-category
// Updates properties of a category channel in a guild.
export default async function (server, toolName = 'discord-update-category') {
  server.tool(
    toolName,
    'Rename or update category permissions.',
    {
      guildId: z.string(),
      categoryId: z.string(),
      name: z.string().optional(),
      position: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
    },
    async (args, extra) => {
      const { guildId, categoryId, ...updateFields } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
      const category = guild.channels.cache.get(categoryId);
      if (!category || category.type !== 4) throw new Error('Category not found or is not a category channel.');
      Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
      let updatedCategory;
      try {
        updatedCategory = await category.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update category: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, categoryId: updatedCategory.id }, null, 2) },
        ],
      };
    }
  );
}
