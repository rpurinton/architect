import { z } from 'zod';

// Tool: move-voice-member
// Moves a member from one voice channel to another.
export default async function (server, toolName = 'discord-move-voice-member') {
  server.tool(
    toolName,
    'Move a member between two voice channels.',
    {
      guildId: z.string(),
      memberId: z.string(),
      channelId: z.string(), // Target voice channel
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, memberId, channelId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error('Member not found. Try discord-list-members first.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || channel.type !== 2) throw new Error('Target channel not found or is not a voice channel.');
      try {
        await member.voice.setChannel(channel, reason);
      } catch (err) {
        throw new Error('Failed to move member: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, memberId, channelId }, null, 2) },
        ],
      };
    }
  );
}
