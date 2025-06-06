import { z } from 'zod';

// Tool: list-bans
// Lists all bans in a guild.
export default async function (server, toolName = 'discord-list-bans') {
  server.tool(
    toolName,
    'List all banned users in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
      let bans;
      try {
        bans = await guild.bans.fetch();
      } catch (err) {
        throw new Error('Failed to fetch bans: ' + (err.message || err));
      }
      const banList = Array.from(bans.values()).map(ban => ({
        userId: ban.user.id,
        username: ban.user.username,
        discriminator: ban.user.discriminator,
        reason: ban.reason,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(banList, null, 2) },
        ],
      };
    }
  );
}
