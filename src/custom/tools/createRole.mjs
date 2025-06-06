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
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
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
