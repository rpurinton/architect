import { z } from 'zod';

// Tool: create-role
// Creates a new role in a guild.
export default async function (server, toolName = 'discord-create-role') {
  server.tool(
    toolName,
    'Create a new role with specified permissions and color.',
    {
      guildId: z.string(),
      name: z.string(),
      color: z.number().optional(),
      hoist: z.boolean().optional(),
      mentionable: z.boolean().optional(),
      permissions: z.array(z.string()).optional(),
      position: z.number().optional(),
    },
    async (args, extra) => {
      const { guildId, ...roleData } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      // Helper to convert ALL_CAPS permission names to PascalCase
      function toPascalCase(perm) {
        if (!perm) return perm;
        if (/^[A-Z0-9_]+$/.test(perm)) {
          return perm.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
        }
        return perm;
      }
      // Massage permissions array if present
      if (Array.isArray(roleData.permissions)) {
        roleData.permissions = roleData.permissions.map(toPascalCase);
      }
      // Remove undefined, null, empty string, empty array, or 0 (for optional fields) from roleData
      Object.keys(roleData).forEach(key => {
        const val = roleData[key];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'number' && val === 0 && key !== 'position')
        ) {
          delete roleData[key];
        }
      });
      // Remove undefined fields
      Object.keys(roleData).forEach(key => roleData[key] === undefined && delete roleData[key]);
      let role;
      try {
        role = await guild.roles.create({ ...roleData });
      } catch (err) {
        throw new Error('Failed to create role: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, roleId: role.id }, null, 2) },
        ],
      };
    }
  );
}
