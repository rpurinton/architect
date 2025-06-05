import { z } from 'zod';

const listChannelsRequestSchema = z.object({ guildId: z.string() });
const listChannelsResponseSchema = z.object({
  channels: z.array(z.object({ id: z.string(), name: z.string(), type: z.string() })),
});

export function listChannelsTool(server, toolName = 'list-channels') {
  server.tool(
    toolName,
    'Returns a list of channels in a guild.',
    { guildId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      console.log('Full args:', args);
      console.log('Requested guildId:', guildId, 'Type:', typeof guildId);
      const availableGuilds = Array.from(global.client.guilds.cache.keys());
      console.log('Available guild IDs:', availableGuilds);
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const channels = guild.channels.cache.map(ch => ({
        id: ch.id,
        name: ch.name,
        type: ch.type?.toString() || String(ch.type),
      }));
      const response = listChannelsResponseSchema.parse({ channels });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default listChannelsTool;
