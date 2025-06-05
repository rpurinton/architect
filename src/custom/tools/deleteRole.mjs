import { z } from 'zod';

// Tool: delete-role
// Deletes a role from a guild.
export default async function (server, toolName = 'delete-role') {
  server.tool(
    toolName,
    'Remove a role from the guild.',
    {
      guildId: z.string(),
      roleId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, roleId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const role = guild.roles.cache.get(roleId);
      if (!role) throw new Error('Role not found. Please re-run with a valid Role ID.');
      try {
        await role.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete role: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, deletedRoleId: roleId }, null, 2) },
        ],
      };
    }
  );
}
