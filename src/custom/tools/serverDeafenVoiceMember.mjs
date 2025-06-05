import { z } from 'zod';

// Tool: server-deafen-voice-member
// Deafens or undeafens a member in a voice channel.
export default async function (server, toolName = 'server-deafen-voice-member') {
  server.tool(
    toolName,
    'Deafen or undeafen a member in a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      deaf: z.boolean(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, deaf, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Please re-run with a valid Member ID.');
      try {
        await member.voice.setDeaf(deaf, reason);
      } catch (err) {
        throw new Error('Failed to set deafen state: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, deaf }, null, 2) },
        ],
      };
    }
  );
}
