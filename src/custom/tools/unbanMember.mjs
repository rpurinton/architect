import { z } from 'zod';

// Tool: unban-member
// Unbans a user from a guild.
export default async function (server, toolName = 'unban-member') {
  server.tool(
    toolName,
    'Remove ban from a user.',
    {
      guildId: z.string(),
      userId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, userId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      try {
        await guild.bans.remove(userId, reason);
      } catch (err) {
        throw new Error('Failed to unban user: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, userId }, null, 2) },
        ],
      };
    }
  );
}
