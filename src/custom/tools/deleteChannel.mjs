import { z } from 'zod';

// Tool: delete-channel
// Deletes a channel from a guild.
export default async function (server, toolName = 'delete-channel') {
  server.tool(
    toolName,
    'Remove a specified channel from a guild.',
    {
      guildId: z.string(),
      channelId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error('Channel not found. Please re-run with a valid Channel ID.');
      try {
        await channel.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete channel: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, deletedChannelId: channelId }, null, 2) },
        ],
      };
    }
  );
}
