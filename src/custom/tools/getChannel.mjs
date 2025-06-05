import { z } from 'zod';

const getChannelRequestSchema = z.object({ guildId: z.string(), channelId: z.string() });
const getChannelResponseSchema = z.object({ channel: z.any() });

export function getChannelTool(server, toolName = 'get-channel') {
  server.tool(
    toolName,
    'Returns all details about a given channel, including all settings and permissions (not message history).',
    { guildId: z.string(), channelId: z.string() },
    async ({ guildId, channelId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error('Channel not found');

      // Gather all relevant channel info
      const base = {
        id: channel.id,
        guildId: channel.guildId,
        name: channel.name,
        type: channel.type,
        position: channel.rawPosition,
        parentId: channel.parentId,
        createdAt: channel.createdAt,
        topic: channel.topic,
        nsfw: channel.nsfw,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        rateLimitPerUser: channel.rateLimitPerUser,
        lastPinTimestamp: channel.lastPinAt || channel.lastPinTimestamp,
        lastMessageId: channel.lastMessageId,
        archived: channel.archived,
        locked: channel.locked,
        defaultAutoArchiveDuration: channel.defaultAutoArchiveDuration,
        flags: channel.flags ? channel.flags.toArray?.() : undefined,
        // Add more fields as needed for other channel types
      };

      // Permission overwrites
      let permissionOverwrites = [];
      if (channel.permissionOverwrites && channel.permissionOverwrites.cache) {
        permissionOverwrites = Array.from(channel.permissionOverwrites.cache.values()).map(po => ({
          id: po.id,
          type: po.type,
          allow: po.allow?.bitfield?.toString() || po.allow?.toString(),
          deny: po.deny?.bitfield?.toString() || po.deny?.toString(),
        }));
      }
      base.permissionOverwrites = permissionOverwrites;

      // Remove undefined/null fields for cleanliness
      const channelInfo = Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null));

      const response = getChannelResponseSchema.parse({ channel: channelInfo });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default getChannelTool;
