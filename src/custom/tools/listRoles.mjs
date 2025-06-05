import { z } from 'zod';

const listRolesRequestSchema = z.object({ guildId: z.string() });
const listRolesResponseSchema = z.object({
  roles: z.array(z.object({ id: z.string(), name: z.string() })),
});

export function listRolesTool(server, toolName = 'list-roles') {
  server.tool(
    toolName,
    'Returns a list of roles in a guild.',
    { guildId: z.string() },
    async ({ guildId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const roles = guild.roles.cache.map(role => ({ id: role.id, name: role.name }));
      const response = listRolesResponseSchema.parse({ roles });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default listRolesTool;
