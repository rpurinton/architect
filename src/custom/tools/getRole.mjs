import { z } from 'zod';
import { PermissionsBitField } from 'discord.js';

const getRoleRequestSchema = z.object({ guildId: z.string(), roleId: z.string() });
const getRoleResponseSchema = z.object({ role: z.any() });

export default async function (server, toolName = 'get-role') {
  server.tool(
    toolName,
    'Returns all details about a given role, including permissions and a list of members with that role.',
    getRoleRequestSchema,
    async ({ guildId, roleId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const role = guild.roles.cache.get(roleId);
      if (!role) throw new Error('Role not found');

      // Permissions as array of names
      const permissions = new PermissionsBitField(role.permissions).toArray();

      // Members with this role
      const members = guild.members.cache.filter(m => m.roles.cache.has(roleId)).map(member => ({
        id: member.id,
        tag: member.user?.tag,
        username: member.user?.username,
        discriminator: member.user?.discriminator,
        avatar: member.user?.displayAvatarURL?.({ dynamic: true, size: 1024 }),
        joinedAt: member.joinedAt,
        displayName: member.displayName || member.nickname || member.user?.username,
      }));

      const base = {
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
        hoist: role.hoist,
        managed: role.managed,
        mentionable: role.mentionable,
        permissions,
        createdAt: role.createdAt,
        members,
      };

      // Remove undefined/null fields
      const roleInfo = Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null));
      const response = getRoleResponseSchema.parse({ role: roleInfo });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}
