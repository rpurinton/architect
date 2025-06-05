import { z } from 'zod';

const listGuildsRequestSchema = z.object({});
const listGuildsResponseSchema = z.object({
  guilds: z.array(z.object({ id: z.string(), name: z.string() })),
});

export default async function (server, toolName = 'list-guilds') {
  server.tool(
    toolName,
    'Returns a list of guilds the bot is in.',
    listGuildsRequestSchema,
    async () => {
      const guilds = global.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
      }));
      // Validate output with response schema
      const response = listGuildsResponseSchema.parse({ guilds });
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
