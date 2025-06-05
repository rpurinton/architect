import { z } from 'zod';

const getRoleRequestSchema = z.object({ guildId: z.string(), roleId: z.string() });
const getRoleResponseSchema = z.object({ role: z.any() });

export function getRoleTool(server, toolName = 'get-role') {
  server.tool(
    toolName,
    'Returns all details about a given role.',
    getRoleRequestSchema,
    async ({ guildId, roleId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const role = guild.roles.cache.get(roleId);
      if (!role) throw new Error('Role not found');
      const response = getRoleResponseSchema.parse({ role });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default getRoleTool;
