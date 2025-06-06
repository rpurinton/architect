import { z } from 'zod';

// Tool: ban-member
// Bans a member from a guild.
export default async function (server, toolName = 'discord-ban-member') {
  server.tool(
    toolName,
    'Ban a member with optional reason and duration.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
      deleteMessageSeconds: z.number().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, reason, deleteMessageSeconds } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Try discord-list-members first.');
      try {
        await member.ban({ reason, deleteMessageSeconds });
      } catch (err) {
        throw new Error('Failed to ban member: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId }, null, 2) },
        ],
      };
    }
  );
}
