import { z } from 'zod';

// Tool: delete-thread
// Deletes a thread in a channel.
export default async function (server, toolName = 'discord-delete-thread') {
  server.tool(
    toolName,
    'Delete a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      threadId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, threadId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || typeof channel.threads?.fetch !== 'function') throw new Error('Channel not found or cannot fetch threads.');
      let thread;
      try {
        thread = await channel.threads.fetch(threadId);
        await thread.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete thread: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, threadId }, null, 2) },
        ],
      };
    }
  );
}
