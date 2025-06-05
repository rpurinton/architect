import { z } from 'zod';

export default async function (server, toolName = 'list-members') {
  server.tool(
    toolName,
    'Returns a concise list of members in a guild, with only the most crucial high-level information.',
    { guildId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Please re-run with a Guild ID#.  Use list-guilds for a list. `);
      const members = guild.members.cache.map(member => ({
        id: member.id,
        tag: member.user?.tag,
        username: member.user?.username,
        discriminator: member.user?.discriminator,
        bot: member.user?.bot,
        displayName: member.displayName || member.nickname || member.user?.username,
        joinedAt: member.joinedAt,
        avatar: member.user?.displayAvatarURL?.({ dynamic: true, size: 1024 }),
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(members, null, 2) },
        ],
      };
    }
  );
}
