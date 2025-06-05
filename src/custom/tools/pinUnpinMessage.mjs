import { z } from 'zod';

// Tool: pin-unpin-message
// Pins or unpins a message in a channel.
export default async function (server, toolName = 'pin-unpin-message') {
  server.tool(
    toolName,
    'Pin or unpin a message in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      messageId: z.string(),
      pin: z.boolean(),
    },
    async (args, extra) => {
      const { guildId, channelId, messageId, pin } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || typeof channel.messages?.fetch !== 'function') throw new Error('Channel not found or cannot fetch messages.');
      let message;
      try {
        message = await channel.messages.fetch(messageId);
        if (!message) throw new Error('Message not found.');
        if (pin) {
          await message.pin();
        } else {
          await message.unpin();
        }
      } catch (err) {
        throw new Error('Failed to pin/unpin message: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, messageId, pin }, null, 2) },
        ],
      };
    }
  );
}
