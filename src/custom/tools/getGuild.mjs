import { z } from 'zod';

const getGuildRequestSchema = z.object({ guildId: z.string() });
const getGuildResponseSchema = z.object({ guild: z.any() });

export function getGuildTool(server, toolName = 'get-guild') {
  server.tool(
    toolName,
    'Returns all details about a given guild.',
    getGuildRequestSchema,
    async ({ guildId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      // Return all details (raw object)
      const response = getGuildResponseSchema.parse({ guild });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default getGuildTool;
