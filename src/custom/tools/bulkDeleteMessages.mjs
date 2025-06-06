import { z } from 'zod';

// Tool: bulk-delete-messages
// Bulk deletes messages in a channel with advanced filtering. Returns deleted message IDs.
export default async function (server, toolName = 'discord-bulk-delete-messages') {
  server.tool(
    toolName,
    'Bulk delete messages in a channel with advanced filters. Returns deleted message IDs.',
    {
      guildId: z.string(),
      channelId: z.string(),
      limit: z.number().min(1).max(100).optional(),
      bot: z.boolean().optional(),
      embedOnly: z.boolean().optional(),
      userId: z.string().optional(),
      contains: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, limit = 100, bot, embedOnly, userId, contains } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || typeof channel.messages?.fetch !== 'function') throw new Error('Channel not found or cannot fetch messages.');
      let messages;
      try {
        messages = await channel.messages.fetch({ limit });
      } catch (err) {
        throw new Error('Failed to fetch messages: ' + (err.message || err));
      }
      let filtered = Array.from(messages.values());
      if (bot !== undefined) filtered = filtered.filter(m => m.author.bot === bot);
      if (embedOnly) filtered = filtered.filter(m => m.embeds && m.embeds.length > 0);
      if (userId) filtered = filtered.filter(m => m.author.id === userId);
      if (contains) filtered = filtered.filter(m => m.content.includes(contains));
      // Discord only allows bulk delete of messages younger than 14 days
      filtered = filtered.filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
      let deleted = [];
      try {
        const res = await channel.bulkDelete(filtered.map(m => m.id));
        deleted = Array.from(res.values()).map(m => m.id);
      } catch (err) {
        throw new Error('Failed to bulk delete messages: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, deleted }, null, 2) },
        ],
      };
    }
  );
}
