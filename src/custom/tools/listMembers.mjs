import { z } from 'zod';

export default async function (server, toolName = 'discord-list-members') {
  server.tool(
    toolName,
    'Returns a concise list of members in a guild, with only the most crucial high-level information. Supports limit and always fetches from API if not in cache.',
    { guildId: z.string(), limit: z.number().min(1).max(1000).optional() },
    async (args, extra) => {
      const { guildId, limit = 1000 } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found.`);
      let members;
      try {
        members = await guild.members.fetch({ limit });
      } catch {
        members = guild.members.cache;
      }
      const result = Array.from(members.values()).slice(0, limit).map(member => ({
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
          { type: 'text', text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );
}
