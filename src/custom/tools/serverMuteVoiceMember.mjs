import { z } from 'zod';

// Tool: server-mute-voice-member
// Mutes or unmutes a member in a voice channel.
export default async function (server, toolName = 'discord-server-mute-voice-member') {
  server.tool(
    toolName,
    'Mute or unmute a member in a voice channel.',
    {
      guildId: z.string(),
      memberId: z.string(),
      mute: z.boolean(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, mute, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Try discord-list-members first.');
      try {
        await member.voice.setMute(mute, reason);
      } catch (err) {
        throw new Error('Failed to set mute state: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, mute }, null, 2) },
        ],
      };
    }
  );
}
