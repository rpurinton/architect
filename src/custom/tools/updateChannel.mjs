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
      // Add more channel properties as needed
    },
    async (args, extra) => {
      // Define channel type constants at the top
      const textTypes = [0, 5, 15, 13]; // GUILD_TEXT, ANNOUNCEMENT, FORUM, STAGE
      const voiceTypes = [2]; // GUILD_VOICE
      const { guildId, channelId, ...updateFields } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      let channel = guild.channels.cache.get(channelId);
      if (!channel) {
        // Try fetching from API if not in cache
        try {
          channel = await guild.channels.fetch(channelId);
        } catch {
          throw new Error('Channel not found.  Try discord-list-channels first.');
        }
      }
      // Treat empty permissionOverwrites array as undefined
      if (Array.isArray(updateFields.permissionOverwrites) && updateFields.permissionOverwrites.length === 0) {
        updateFields.permissionOverwrites = undefined;
      }
      // Remove undefined, null, empty string, empty array, or 0 (for optional fields) from updateFields
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
      // Map parentId to parent for Discord.js compatibility
      if (updateFields.parentId !== undefined) {
        updateFields.parent = updateFields.parentId;
        delete updateFields.parentId;
      }
      // Remove bitrate and userLimit if not a voice channel or if 0
      if (!voiceTypes.includes(channel.type)) {
        delete updateFields.bitrate;
        delete updateFields.userLimit;
      } else {
        if (updateFields.bitrate === 0) delete updateFields.bitrate;
        if (updateFields.userLimit === 0) delete updateFields.userLimit;
      }
      // Remove topic if not a text/announcement/forum/stage channel
      if (!textTypes.includes(channel.type)) {
        delete updateFields.topic;
      }
      // Remove archived and locked if not a thread or applicable channel type
      if (updateFields.archived !== undefined && channel.type !== 11 && channel.type !== 12) {
        delete updateFields.archived;
      }
      if (updateFields.locked !== undefined && channel.type !== 11 && channel.type !== 12) {
        delete updateFields.locked;
      }
      // Auto-convert ALL_CAPS permission names to PascalCase for Discord.js compatibility
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
      // Return a summary of the updated channel
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
