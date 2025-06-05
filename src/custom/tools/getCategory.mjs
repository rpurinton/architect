import { z } from 'zod';

const getCategoryRequestSchema = z.object({ guildId: z.string(), categoryId: z.string() });
const getCategoryResponseSchema = z.object({ category: z.any() });

export function getCategoryTool(server, toolName = 'get-category') {
  server.tool(
    toolName,
    'Returns all details about a given channel category.',
    getCategoryRequestSchema,
    async ({ guildId, categoryId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const category = guild.channels.cache.get(categoryId);
      if (!category || (category.type !== 4 && category.type !== 'GUILD_CATEGORY')) throw new Error('Category not found');
      const response = getCategoryResponseSchema.parse({ category });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default getCategoryTool;
