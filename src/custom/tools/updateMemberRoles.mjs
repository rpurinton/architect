import { z } from 'zod';

// Tool: update-member-roles
// Sets or updates all roles for a member in a guild, validates role IDs, returns updated roles.
export default async function (server, toolName = 'update-member-roles') {
  server.tool(
    toolName,
    'Set or update all roles for a member in a guild. Validates role IDs and returns updated roles.',
    {
      guildId: z.string(),
      memberId: z.string(),
      roleIds: z.array(z.string()),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, roleIds, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      let member = guild.members.cache.get(memberId);
      if (!member) {
        member = await guild.members.fetch(memberId).catch(() => null);
      }
      if (!member) throw new Error('Member not found. Please re-run with a valid Member ID.');
      // Validate role IDs
      const validRoleIds = roleIds.filter(id => guild.roles.cache.has(id));
      if (validRoleIds.length !== roleIds.length) {
        throw new Error('One or more role IDs are invalid for this guild.');
      }
      try {
        await member.roles.set(validRoleIds, reason);
      } catch (err) {
        throw new Error('Failed to update member roles: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, roles: member.roles.cache.map(r => r.id) }, null, 2) },
        ],
      };
    }
  );
}
