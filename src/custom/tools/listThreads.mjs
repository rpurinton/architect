import { z } from 'zod';

// Tool: list-threads
// Lists all active threads in a channel.
export default async function (server, toolName = 'list-threads') {
  server.tool(
    toolName,
    'List all active threads in a channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
    },
    async (args, extra) => {
      const { guildId, channelId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || typeof channel.threads?.fetchActive !== 'function') throw new Error('Channel not found or cannot fetch threads.');
      let threads;
      try {
        threads = await channel.threads.fetchActive();
      } catch (err) {
        throw new Error('Failed to fetch threads: ' + (err.message || err));
      }
      const threadList = Array.from(threads.threads.values()).map(th => ({
        id: th.id,
        name: th.name,
        ownerId: th.ownerId,
        archived: th.archived,
        locked: th.locked,
        createdAt: th.createdAt,
        type: th.type,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(threadList, null, 2) },
        ],
      };
    }
  );
}
