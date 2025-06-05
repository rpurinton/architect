import { z } from 'zod';

// Tool: update-member-nickname
// Updates a member's nickname in a guild, with improved error handling and returns updated info.
export default async function (server, toolName = 'update-member-nickname') {
  server.tool(
    toolName,
    "Change a member's nickname in a guild. Returns updated member info.",
    {
      guildId: z.string(),
      memberId: z.string(),
      nickname: z.string().nullable(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, nickname, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let member = guild.members.cache.get(memberId);
      if (!member) {
        member = await guild.members.fetch(memberId).catch(() => null);
      }
      if (!member) throw new Error('Member not found. Try list-members first.');
      try {
        await member.setNickname(nickname, reason);
      } catch (err) {
        throw new Error('Failed to update nickname: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, nickname: member.nickname, displayName: member.displayName }, null, 2) },
        ],
      };
    }
  );
}
