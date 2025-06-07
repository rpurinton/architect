import { z } from 'zod';
import { getGuild, getChannel, fetchAndFilterMessages, buildResponse } from '../toolHelpers.mjs';

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
      const { guildId, channelId, limit, bot, embedOnly, userId, contains } = args;
      const guild = getGuild(guildId);
      const channel = await getChannel(guild, channelId);
      let filtered = await fetchAndFilterMessages(channel, { limit, bot, embedOnly, userId, contains });
      let deleted = [];
      try {
        const res = await channel.bulkDelete(filtered.map(m => m.id));
        deleted = Array.from(res.values()).map(m => m.id);
      } catch (err) {
        throw new Error('Failed to bulk delete messages: ' + (err.message || err));
      }
      return buildResponse({ success: true, deleted });
    }
  );
}
