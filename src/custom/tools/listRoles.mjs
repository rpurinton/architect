import { z } from 'zod';

export default async function (server, toolName = 'list-roles') {
  server.tool(
    toolName,
    'Returns a concise list of roles in a guild, with only the most crucial high-level information.',
    { guildId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Please re-run with a Guild ID#.  Use list-guilds for a list. `);
      const roles = guild.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => {
          let managedUser = null;
          if (role.managed) {
            managedUser = guild.members.cache.find(m => m.user && m.user.bot && m.roles.cache.has(role.id));
          }
          return {
            id: role.id,
            name: role.name,
            color: role.color,
            position: role.position,
            hoist: role.hoist,
            managed: role.managed,
            mentionable: role.mentionable,
            permissions: role.permissions?.toArray?.() || [],
            memberCount: guild.members.cache.filter(m => m.roles.cache.has(role.id)).size,
            managedUser: role.managed && managedUser ? {
              id: managedUser.user.id,
              username: managedUser.user.username,
              discriminator: managedUser.user.discriminator,
              bot: managedUser.user.bot
            } : undefined
          };
        });
      return {
        content: [
          { type: 'text', text: JSON.stringify(roles, null, 2) },
        ],
      };
    }
  );
}
