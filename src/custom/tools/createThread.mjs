import { z } from 'zod';

// Tool: create-thread
// Creates a thread in a channel.
export default async function (server, toolName = 'discord-create-thread') {
  server.tool(
    toolName,
    'Create a thread in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string(),
      autoArchiveDuration: z.number().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, name, autoArchiveDuration, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || typeof channel.threads?.create !== 'function') throw new Error('Channel not found or cannot create threads.');
      let thread;
      try {
        thread = await channel.threads.create({ name, autoArchiveDuration, reason });
      } catch (err) {
        throw new Error('Failed to create thread: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, threadId: thread.id }, null, 2) },
        ],
      };
    }
  );
}
