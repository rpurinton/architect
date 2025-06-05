import { z } from 'zod';

const getGuildsRequestSchema = z.object({});
const getGuildsResponseSchema = z.object({
  guilds: z.array(z.object({ id: z.string(), name: z.string() })),
});

export function getGuildsTool(server) {
  server.tool(
    'get-guilds',
    'Returns a list of guilds the bot is in.',
    {}, // No input schema
    async () => {
      const guilds = global.client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
      }));
      return { guilds };
    }
  );
}

export default getGuildsTool;
