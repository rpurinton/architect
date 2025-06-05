import { z } from 'zod';

// Tool: update-role
// Updates properties of a role in a guild, with improved error handling and summary return.
export default async function (server, toolName = 'update-role') {
  server.tool(
    toolName,
    'Change role name, permissions, color, hoist status, and more. Returns updated role summary.',
    {
      guildId: z.string(),
      roleId: z.string(),
      name: z.string().optional(),
      color: z.number().optional(),
      hoist: z.boolean().optional(),
      mentionable: z.boolean().optional(),
      permissions: z.array(z.string()).optional(),
      position: z.number().optional(),
    },
    async (args, extra) => {
      const { guildId, roleId, ...updateFields } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let role = guild.roles.cache.get(roleId);
      if (!role) {
        try {
          role = await guild.roles.fetch(roleId);
        } catch {
          throw new Error('Role not found. Please re-run with a valid Role ID.');
        }
      }
      Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
      let updatedRole;
      try {
        updatedRole = await role.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update role: ' + (err.message || err));
      }
      const summary = {
        id: updatedRole.id,
        name: updatedRole.name,
        color: updatedRole.color,
        hoist: updatedRole.hoist,
        mentionable: updatedRole.mentionable,
        permissions: updatedRole.permissions?.toArray?.() || [],
        position: updatedRole.position,
      };
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, updated: summary }, null, 2) },
        ],
      };
    }
  );
}
