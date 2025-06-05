import { z } from 'zod';

export default async function (server, toolName = 'get-role') {
  server.tool(
    toolName,
    'Returns all available details about a given role, including all properties, permissions (bitfield and names), and a detailed list of members with that role.',
    { guildId: z.string(), roleId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Provided: ${guildId}. Available: ${Array.from(global.client.guilds.cache.keys()).join(', ')}`);
      const roleId = args.roleId;
      if (!roleId) throw new Error('Role ID is required');
      const role = guild.roles.cache.get(roleId);
      if (!role) throw new Error(`Role not found. Provided: ${roleId}`);
      const permissions = role.permissions?.toArray?.() || [];
      const permissionsBitfield = role.permissions?.bitfield || null;
      const members = guild.members.cache
        .filter(m => m.roles.cache.has(roleId))
        .map(member => ({
          id: member.id,
          tag: member.user?.tag,
          username: member.user?.username,
          discriminator: member.user?.discriminator,
          avatar: member.user?.displayAvatarURL?.({ dynamic: true, size: 1024 }),
          joinedAt: member.joinedAt,
          displayName: member.displayName || member.nickname || member.user?.username,
          bot: member.user?.bot,
          user: member.user ? {
            id: member.user.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            tag: member.user.tag,
            avatar: member.user.displayAvatarURL?.({ dynamic: true, size: 1024 }),
            bot: member.user.bot
          } : undefined,
          nickname: member.nickname,
          roles: member.roles.cache.map(r => r.id),
          pending: member.pending,
          premiumSince: member.premiumSince,
          communicationDisabledUntil: member.communicationDisabledUntil,
        }));

      // Managed user (for bot roles)
      let managedUser = null;
      if (role.managed) {
        managedUser = guild.members.cache.find(m => m.user && m.user.bot && m.roles.cache.has(role.id));
      }

      // All possible role properties
      const roleInfo = {
        id: role.id,
        name: role.name,
        color: role.color,
        hexColor: role.hexColor,
        position: role.position,
        rawPosition: role.rawPosition,
        hoist: role.hoist,
        managed: role.managed,
        mentionable: role.mentionable,
        permissions,
        permissionsBitfield,
        createdAt: role.createdAt,
        createdTimestamp: role.createdTimestamp,
        deleted: role.deleted,
        icon: role.icon,
        unicodeEmoji: role.unicodeEmoji,
        tags: role.tags,
        memberCount: members.length,
        members,
        managedUser: role.managed && managedUser ? {
          id: managedUser.user.id,
          username: managedUser.user.username,
          discriminator: managedUser.user.discriminator,
          bot: managedUser.user.bot
        } : undefined,
      };

      // Remove undefined/null fields for cleanliness
      const cleanRoleInfo = Object.fromEntries(Object.entries(roleInfo).filter(([_, v]) => v !== undefined && v !== null));
      return {
        content: [
          { type: 'text', text: JSON.stringify(cleanRoleInfo, null, 2) },
        ],
      };
    }
  );
}
