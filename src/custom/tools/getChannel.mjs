import { z } from 'zod';

const getChannelRequestSchema = z.object({ guildId: z.string(), channelId: z.string() });
const getChannelResponseSchema = z.object({ channel: z.any() });

export function getChannelTool(server, toolName = 'get-channel') {
  server.tool(
    toolName,
    'Returns all details about a given channel.',
    { guildId: z.string(), channelId: z.string() },
    async ({ guildId, channelId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error('Channel not found');
      const response = getChannelResponseSchema.parse({ channel });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default getChannelTool;
