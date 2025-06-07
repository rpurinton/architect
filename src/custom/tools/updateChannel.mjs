import { z } from 'zod';

// Tool: update-channel
// Updates properties of a channel in a guild, with validation for channel type and improved error handling.
export default async function (server, toolName = 'discord-update-channel') {
  server.tool(
    toolName,
    'Update channel name, topic, NSFW flag, bitrate, user limit, and more. Validates properties for channel type and returns updated summary.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string().optional(),
      topic: z.string().optional(),
      nsfw: z.boolean().optional(),
      position: z.number().optional(),
      rateLimitPerUser: z.number().optional(),
      parentId: z.string().optional(),
      bitrate: z.number().optional(),
      userLimit: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
      archived: z.boolean().optional(),
      locked: z.boolean().optional(),
    },
    async (args, extra) => {
      const textTypes = [0, 5, 15, 13]; // GUILD_TEXT, ANNOUNCEMENT, FORUM, STAGE
      const voiceTypes = [2]; // GUILD_VOICE
      const { guildId, channelId, ...updateFields } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      let channel = guild.channels.cache.get(channelId);
      if (!channel) {
        try {
          channel = await guild.channels.fetch(channelId);
        } catch {
          throw new Error('Channel not found.  Try discord-list-channels first.');
        }
      }
      if (Array.isArray(updateFields.permissionOverwrites) && updateFields.permissionOverwrites.length === 0) {
        updateFields.permissionOverwrites = undefined;
      }
      Object.keys(updateFields).forEach(key => {
        const val = updateFields[key];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'number' && val === 0 && !['position','rateLimitPerUser','bitrate','userLimit'].includes(key))
        ) {
          delete updateFields[key];
        }
      });
      if (updateFields.parentId !== undefined) {
        updateFields.parent = updateFields.parentId;
        delete updateFields.parentId;
      }
      if (!voiceTypes.includes(channel.type)) {
        delete updateFields.bitrate;
        delete updateFields.userLimit;
      } else {
        if (updateFields.bitrate === 0) delete updateFields.bitrate;
        if (updateFields.userLimit === 0) delete updateFields.userLimit;
      }
      if (!textTypes.includes(channel.type)) {
        delete updateFields.topic;
      }
      if (updateFields.archived !== undefined && channel.type !== 11 && channel.type !== 12) {
        delete updateFields.archived;
      }
      if (updateFields.locked !== undefined && channel.type !== 11 && channel.type !== 12) {
        delete updateFields.locked;
      }
      function toPascalCase(perm) {
        if (!perm) return perm;
        if (/^[A-Z0-9_]+$/.test(perm)) {
          return perm.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
        }
        return perm;
      }
      if (Array.isArray(updateFields.permissionOverwrites)) {
        updateFields.permissionOverwrites = updateFields.permissionOverwrites.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCase) : undefined,
          deny: o.deny ? o.deny.map(toPascalCase) : undefined,
        }));
      }
      let updatedChannel;
      try {
        updatedChannel = await channel.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update channel: ' + (err.message || err));
      }
      const summary = {
        id: updatedChannel.id,
        name: updatedChannel.name,
        type: updatedChannel.type,
        topic: updatedChannel.topic,
        nsfw: updatedChannel.nsfw,
        position: updatedChannel.rawPosition,
        parentId: updatedChannel.parentId,
        bitrate: updatedChannel.bitrate,
        userLimit: updatedChannel.userLimit,
        archived: updatedChannel.archived,
        locked: updatedChannel.locked,
      };
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, updated: summary }, null, 2) },
        ],
      };
    }
  );
}
