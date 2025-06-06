import { z } from 'zod';

// Tool: remove-role-from-member
// Removes a role from a member in a guild.
export default async function (server, toolName = 'discord-remove-role-from-member') {
  server.tool(
    toolName,
    'Remove a role from a guild member.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleId: z.string(),
    },
    async (args, extra) => {
      const { guildId, memberId, roleId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Try discord-list-members first.');
      try {
        await member.roles.remove(roleId);
      } catch (err) {
        throw new Error('Failed to remove role: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, roleId }, null, 2) },
        ],
      };
    }
  );
}
