import { z } from 'zod';

export default async function (server, toolName = 'list-roles') {
  server.tool(
    toolName,
    'Returns a concise list of roles in a guild, with only the most crucial high-level information.',
    { guildId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Provided: ${guildId}. Available: ${Array.from(global.client.guilds.cache.keys()).join(', ')}`);
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
      return {
        content: [
          { type: 'text', text: JSON.stringify(roles, null, 2) },
        ],
      };
    }
  );
}
