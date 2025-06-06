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
      // Remove undefined fields
      Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
      // Map parentId to parent for Discord.js compatibility
      if (updateFields.parentId !== undefined) {
        updateFields.parent = updateFields.parentId;
        delete updateFields.parentId;
      }
      // Remove bitrate if not a voice channel
      if (updateFields.bitrate !== undefined && !voiceTypes.includes(channel.type)) {
        updateFields.bitrate = undefined;
      }
      // Remove userLimit if not a voice channel
      if (updateFields.userLimit !== undefined && !voiceTypes.includes(channel.type)) {
        updateFields.userLimit = undefined;
      }
      // Validate properties for channel type
      const textTypes = [0, 5, 15, 13]; // GUILD_TEXT, ANNOUNCEMENT, FORUM, STAGE
      if (updateFields.topic !== undefined && !textTypes.includes(channel.type)) {
        throw new Error('Topic can only be set for text/announcement/forum/stage channels.');
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
