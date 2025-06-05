import { z } from 'zod';
import { PermissionsBitField } from 'discord.js';

export default async function (server, toolName = 'get-channel') {
  server.tool(
    toolName,
    'Returns all details about a given channel, including all settings and permissions (not message history).',
    { guildId: z.string(), channelId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Please re-run with a Guild ID#.  Use list-guilds for a list. `);
      const channelId = args.channelId;
      if (!channelId) throw new Error('Channel ID is required');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error(`Channel not found. Please re-run with a Channel ID#. Use list-channels for a list.`);
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
        isAnnouncementChannel: channel.type === 5,
        hideInactivityAfter: channel.defaultAutoArchiveDuration ? ({
          60: '1h',
          1440: '24h',
          4320: '3d',
          10080: '1w',
        }[channel.defaultAutoArchiveDuration] || channel.defaultAutoArchiveDuration + 'm') : undefined,
        // Add more fields as needed for other channel types
      };

      // Permission overwrites
      let permissionOverwrites = [];
      if (channel.permissionOverwrites && channel.permissionOverwrites.cache) {
        permissionOverwrites = await Promise.all(Array.from(channel.permissionOverwrites.cache.values()).map(async po => {
          let name = po.id;
          if (po.type === 0) { // role
            const role = guild.roles.cache.get(po.id);
            if (role) name = `${role.name}`;
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
            }
            // omit unset
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

      // Fetch invites (if supported)
      let invites = [];
      if (typeof channel.fetchInvites === 'function') {
        try {
          const fetched = await channel.fetchInvites();
          invites = Array.from(fetched.values()).map(inv => ({
            code: inv.code,
            inviter: inv.inviter ? `${inv.inviter.username}#${inv.inviter.discriminator}` : undefined,
            uses: inv.uses,
            maxUses: inv.maxUses,
            maxAge: inv.maxAge,
            temporary: inv.temporary,
            createdAt: inv.createdAt,
            expiresAt: inv.expiresAt,
            url: inv.url,
          }));
        } catch (e) {
          invites = [{ error: e.message }];
        }
      }
      base.invites = invites;

      // Fetch integrations (guild-wide, filter for this channel if possible)
      let integrations = [];
      if (typeof guild.fetchIntegrations === 'function') {
        try {
          const fetched = await guild.fetchIntegrations();
          integrations = Array.from(fetched.values()).filter(i => i.channel && i.channel.id === channel.id).map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
            enabled: i.enabled,
            syncing: i.syncing,
            role: i.role ? i.role.name : undefined,
            user: i.user ? `${i.user.username}#${i.user.discriminator}` : undefined,
          }));
        } catch (e) {
          integrations = [{ error: e.message }];
        }
      }

      // Add webhooks for this channel
      let webhooks = [];
      if (typeof channel.fetchWebhooks === 'function') {
        try {
          const fetched = await channel.fetchWebhooks();
          webhooks = Array.from(fetched.values()).map(wh => ({
            id: wh.id,
            name: wh.name,
            type: wh.type,
            url: wh.url,
            createdAt: wh.createdAt,
            creator: wh.owner ? `${wh.owner.username}#${wh.owner.discriminator}` : undefined,
            avatar: wh.avatar,
          }));
        } catch (e) {
          webhooks = [{ error: e.message }];
        }
      }
      integrations.push({ webhooks });

      // Add followed channels (for announcement/news channels)
      let followedChannels = [];
      if (channel.type === 5 && guild.channels && guild.channels.cache) {
        // For announcement channels, find all text channels that follow this one
        followedChannels = Array.from(guild.channels.cache.values())
          .filter(ch => ch.followedChannel && ch.followedChannel.id === channel.id)
          .map(ch => ({
            id: ch.id,
            name: ch.name,
            type: ch.type,
          }));
      }
      if (followedChannels.length > 0) {
        integrations.push({ followedChannels });
      }
      base.integrations = integrations;

      // Remove undefined/null fields for cleanliness
      const channelInfo = Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null));

      return {
        content: [
          { type: 'text', text: JSON.stringify(channelInfo, null, 2) },
        ],
      };
    }
  );
}
