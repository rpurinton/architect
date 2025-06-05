import { z } from 'zod';

// Tool: create-category
// Creates a new category channel in a guild.
export default async function (server, toolName = 'create-category') {
  server.tool(
    toolName,
    'Create a new category channel in a guild.',
    {
      guildId: z.string(),
      name: z.string(),
      position: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
    },
    async (args, extra) => {
      const { guildId, name, position, permissionOverwrites } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const options = {
        type: 4, // 4 = GUILD_CATEGORY
        name,
        position,
        permissionOverwrites,
      };
      Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);
      let category;
      try {
        category = await guild.channels.create(options);
      } catch (err) {
        throw new Error('Failed to create category: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, categoryId: category.id }, null, 2) },
        ],
      };
    }
  );
}
