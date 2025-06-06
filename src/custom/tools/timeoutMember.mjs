import { z } from 'zod';

// Tool: timeout-member
// Timeouts (mutes) a member in a guild for a specified duration.
export default async function (server, toolName = 'discord-timeout-member') {
  server.tool(
    toolName,
    'Timeout (mute) a member for a specified duration and optional reason.',
    {
      guildId: z.string(),
      memberId: z.string(),
      durationMs: z.number(), // Duration in milliseconds
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, durationMs, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Try discord-list-members first.');
      try {
        await member.timeout(durationMs, reason);
      } catch (err) {
        throw new Error('Failed to timeout member: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, durationMs }, null, 2) },
        ],
      };
    }
  );
}
