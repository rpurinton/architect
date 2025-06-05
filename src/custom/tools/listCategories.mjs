import { z } from 'zod';

// Schemas
const listCategoriesRequestSchema = z.object({ guildId: z.string() });
const listCategoriesResponseSchema = z.object({
  categories: z.array(z.object({ id: z.string(), name: z.string() })),
});

export function listCategoriesTool(server, toolName = 'list-categories') {
  server.tool(
    toolName,
    'Returns a list of channel categories in a guild.',
    { guildId: z.string() }, // Updated to match old handler style
    async ({ guildId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const categories = guild.channels.cache
        .filter(c => c.type === 4 || c.type === 'GUILD_CATEGORY')
        .map(cat => ({ id: cat.id, name: cat.name }));
      const response = listCategoriesResponseSchema.parse({ categories });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default listCategoriesTool;
