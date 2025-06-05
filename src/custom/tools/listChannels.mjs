import { z } from 'zod';

const listChannelsRequestSchema = z.object({ guildId: z.string() });
// No longer using strict schema for response, since channel info is richer and varies by type

export function listChannelsTool(server, toolName = 'list-channels') {
  server.tool(
    toolName,
    'Returns a list of channels in a guild, including all settings and permissions.',
    { guildId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Provided: ${guildId}. Available: ${Array.from(global.client.guilds.cache.keys()).join(', ')}`);
      // Get all channels, sorted by sidebar order
      const allChannels = Array.from(guild.channels.cache.values());
      allChannels.sort((a, b) => a.rawPosition - b.rawPosition);

      // Separate categories and other channels
      const categories = allChannels.filter(ch => ch.type === 4); // 4 = GUILD_CATEGORY
      const otherChannels = allChannels.filter(ch => ch.type !== 4);

      // Map categoryId to category object
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.id] = {
          id: cat.id,
          name: cat.name,
          type: cat.type?.toString() || String(cat.type),
          position: cat.rawPosition,
          channels: []
        };
      });

      // Helper to extract rich info for a channel
      function channelInfo(ch) {
        let permissionOverwrites = [];
        if (ch.permissionOverwrites && ch.permissionOverwrites.cache) {
          permissionOverwrites = Array.from(ch.permissionOverwrites.cache.values()).map(po => ({
            id: po.id,
            type: po.type,
            allow: po.allow?.bitfield?.toString() || po.allow?.toString(),
            deny: po.deny?.bitfield?.toString() || po.deny?.toString(),
          }));
        }
        const base = {
          id: ch.id,
          guildId: ch.guildId,
          name: ch.name,
          type: ch.type,
          position: ch.rawPosition,
          parentId: ch.parentId,
          createdAt: ch.createdAt,
          topic: ch.topic,
          nsfw: ch.nsfw,
          bitrate: ch.bitrate,
          userLimit: ch.userLimit,
          rateLimitPerUser: ch.rateLimitPerUser,
          lastPinTimestamp: ch.lastPinAt || ch.lastPinTimestamp,
          lastMessageId: ch.lastMessageId,
          archived: ch.archived,
          locked: ch.locked,
          defaultAutoArchiveDuration: ch.defaultAutoArchiveDuration,
          flags: ch.flags ? ch.flags.toArray?.() : undefined,
          permissionOverwrites,
        };
        // Remove undefined/null fields
        return Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null));
      }

      // Channels with no parent category
      const uncategorized = [];
      otherChannels.forEach(ch => {
        const info = channelInfo(ch);
        if (ch.parentId && categoryMap[ch.parentId]) {
          categoryMap[ch.parentId].channels.push(info);
        } else {
          uncategorized.push(info);
        }
      });

      // Build the final nested result: uncategorized first, then categories in sidebar order
      const nested = [
        ...uncategorized,
        ...categories.map(cat => ({ ...categoryMap[cat.id], channels: categoryMap[cat.id].channels }))
      ];

      return {
        content: [
          { type: 'text', text: JSON.stringify(nested, null, 2) },
        ],
      };
    }
  );
}

export default listChannelsTool;
