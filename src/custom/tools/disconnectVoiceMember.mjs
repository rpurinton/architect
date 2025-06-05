import { z } from 'zod';

// Tool: disconnect-voice-member
// Disconnects a member from a voice channel.
export default async function (server, toolName = 'disconnect-voice-member') {
  server.tool(
    toolName,
    'Disconnect a member from a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Try list-members first.');
      try {
        await member.voice.disconnect(reason);
      } catch (err) {
        throw new Error('Failed to disconnect member: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId }, null, 2) },
        ],
      };
    }
  );
}
