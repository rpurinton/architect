import { z } from 'zod';
import { PermissionsBitField } from 'discord.js';

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
        permissionOverwrites = await Promise.all(Array.from(channel.permissionOverwrites.cache.values()).map(async po => {
          let name = po.id;
          if (po.type === 0) { // role
            const role = guild.roles.cache.get(po.id);
            if (role) name = `@${role.name}`;
          } else if (po.type === 1) { // member/user
            const member = await guild.members.fetch(po.id).catch(() => null);
            if (member) name = `${member.user.username}#${member.user.discriminator}`;
          }

          // Decode permissions
          const allPerms = Object.keys(PermissionsBitField.Flags);
          const allow = BigInt(po.allow?.bitfield?.toString() || po.allow?.toString() || '0');
          const deny = BigInt(po.deny?.bitfield?.toString() || po.deny?.toString() || '0');
          const permissions = {};
          allPerms.forEach(perm => {
            const bit = BigInt(PermissionsBitField.Flags[perm]);
            if ((allow & bit) === bit) {
              permissions[perm] = 'allowed';
            } else if ((deny & bit) === bit) {
              permissions[perm] = 'denied';
            } else {
              permissions[perm] = 'unset';
            }
          });

          return {
            id: po.id,
            type: po.type === 0 ? 'role' : 'member',
            name,
            permissions
          };
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
