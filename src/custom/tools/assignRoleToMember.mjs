import { z } from 'zod';

// Tool: assign-role-to-member
// Assigns a role to a member in a guild.
export default async function (server, toolName = 'assign-role-to-member') {
  server.tool(
    toolName,
    'Add a role to a guild member.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleId: z.string(),
    },
    async (args, extra) => {
      const { guildId, memberId, roleId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Please re-run with a valid Member ID.');
      try {
        await member.roles.add(roleId);
      } catch (err) {
        throw new Error('Failed to assign role: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, roleId }, null, 2) },
        ],
      };
    }
  );
}
