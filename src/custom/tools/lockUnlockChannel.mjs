import { z } from 'zod';

// Tool: lock-unlock-channel
// Locks or unlocks a channel by updating permission overrides for @everyone.
export default async function (server, toolName = 'lock-unlock-channel') {
  server.tool(
    toolName,
    'Lock or unlock a channel by updating @everyone permissions.',
    {
      guildId: z.string(),
      channelId: z.string(),
      lock: z.boolean(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, lock, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error('Channel not found.  Try list-channels first.');
      const everyoneRole = guild.roles.everyone;
      try {
        await channel.permissionOverwrites.edit(everyoneRole, { SEND_MESSAGES: !lock }, { reason });
      } catch (err) {
        throw new Error('Failed to lock/unlock channel: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, channelId, lock }, null, 2) },
        ],
      };
    }
  );
}
