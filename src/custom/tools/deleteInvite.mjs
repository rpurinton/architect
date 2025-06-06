import { z } from 'zod';

// Tool: delete-invite
// Deletes an invite link from a guild.
export default async function (server, toolName = 'discord-delete-invite') {
  server.tool(
    toolName,
    'Revoke an invite link from a guild.',
    {
      guildId: z.string(),
      code: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, code, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
      let invite;
      try {
        invite = await guild.invites.fetch(code);
        if (!invite) throw new Error('Invite not found.');
        await invite.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete invite: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, code }, null, 2) },
        ],
      };
    }
  );
}
