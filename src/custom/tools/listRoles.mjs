import { z } from 'zod';

const listRolesRequestSchema = z.object({ guildId: z.string() });
const listRolesResponseSchema = z.object({
  roles: z.array(z.object({ id: z.string(), name: z.string(), color: z.number(), position: z.number(), hoist: z.boolean(), managed: z.boolean(), mentionable: z.boolean(), permissions: z.array(z.string()), memberCount: z.number() })),
});

export default async function (server, toolName = 'list-roles') {
  server.tool(
    toolName,
    'Returns a concise list of roles in a guild, with only the most crucial high-level information.',
    listRolesRequestSchema,
    async ({ guildId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const roles = guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.color,
          position: role.position,
          hoist: role.hoist,
          managed: role.managed,
          mentionable: role.mentionable,
          permissions: role.permissions?.toArray?.() || [], // short list of perms
          memberCount: guild.members.cache.filter(m => m.roles.cache.has(role.id)).size, // count of members
        }));
      const response = listRolesResponseSchema.parse({ roles });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}
