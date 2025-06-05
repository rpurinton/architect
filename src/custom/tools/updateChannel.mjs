import { z } from 'zod';

// Tool: update-channel
// Updates properties of a channel in a guild.
export default async function (server, toolName = 'update-channel') {
  server.tool(
    toolName,
    'Update channel name, topic, NSFW flag, bitrate, user limit, and more.',
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
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error('Channel not found. Please re-run with a valid Channel ID.');
      // Remove undefined fields
      Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);
      let updatedChannel;
      try {
        updatedChannel = await channel.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update channel: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, channelId: updatedChannel.id }, null, 2) },
        ],
      };
    }
  );
}
