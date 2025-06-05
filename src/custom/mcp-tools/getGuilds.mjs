import { z } from 'zod';
import { getDiscordClient } from '../../custom/mcp-server.mjs';

const getGuildsRequestSchema = z.object({});
const getGuildsResponseSchema = z.object({
  guilds: z.array(z.object({ id: z.string(), name: z.string() })),
});

export async function getGuildsTool(server) {
  server.setRequestHandler(getGuildsRequestSchema, async () => {
    const client = getDiscordClient();
    if (!client) {
      throw new Error('Discord client not initialized');
    }

    const guilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
    }));

    return { guilds };
  }, getGuildsResponseSchema);
}

export default getGuildsTool;
