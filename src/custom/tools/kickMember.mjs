import { z } from 'zod';

// Tool: kick-member
// Kicks a member from a guild.
export default async function (server, toolName = 'kick-member') {
  server.tool(
    toolName,
    'Kick a member from the guild.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Please re-run with a valid Member ID.');
      try {
        await member.kick(reason);
      } catch (err) {
        throw new Error('Failed to kick member: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId }, null, 2) },
        ],
      };
    }
  );
}
