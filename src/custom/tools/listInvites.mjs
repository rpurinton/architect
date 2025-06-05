import { z } from 'zod';

// Tool: list-invites
// Lists all invites in a guild.
export default async function (server, toolName = 'list-invites') {
  server.tool(
    toolName,
    'List all active invite links in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      let invites;
      try {
        invites = await guild.invites.fetch();
      } catch (err) {
        throw new Error('Failed to fetch invites: ' + (err.message || err));
      }
      const inviteList = Array.from(invites.values()).map(invite => ({
        code: invite.code,
        channelId: invite.channel?.id,
        inviter: invite.inviter ? `${invite.inviter.username}#${invite.inviter.discriminator}` : undefined,
        uses: invite.uses,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt,
        url: invite.url,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(inviteList, null, 2) },
        ],
      };
    }
  );
}
