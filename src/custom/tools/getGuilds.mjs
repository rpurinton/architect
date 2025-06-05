import { z } from 'zod';

const getGuildsRequestSchema = z.object({});
const getGuildsResponseSchema = z.object({
  guilds: z.array(z.object({ id: z.string(), name: z.string() })),
});

export function getGuildsTool(server, toolName = 'get-guilds') {
  server.tool(
    toolName,
    'Returns a list of guilds the bot is in.',
    getGuildsRequestSchema, // Use input schema
    async () => {
      const guilds = global.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
      }));
      // Validate output with response schema
      const response = getGuildsResponseSchema.parse({ guilds });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );
}

export default getGuildsTool;
