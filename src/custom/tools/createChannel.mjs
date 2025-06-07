import { z } from 'zod';

// Tool: create-channel
// Creates a new text channel or category in a specified guild.
export default async function (server, toolName = 'discord-create-channel') {
  server.tool(
    toolName,
    'Create a new text channel or category under a specified parent/category.',
    {
      guildId: z.string(),
      name: z.string(),
      type: z.enum(['text', 'category']).default('text'),
      parentId: z.string().optional(), // category ID for text channels
      topic: z.string().optional(),
      nsfw: z.boolean().optional(),
      position: z.number().optional(),
      rateLimitPerUser: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
    },
    async (args, extra) => {
      const { guildId, name, type, parentId, topic, nsfw, position, rateLimitPerUser, permissionOverwrites } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      function toPascalCase(perm) {
        if (!perm) return perm;
        if (/^[A-Z0-9_]+$/.test(perm)) {
          return perm.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
        }
        return perm;
      }
      let processedPermissionOverwrites = permissionOverwrites;
      if (Array.isArray(permissionOverwrites)) {
        processedPermissionOverwrites = permissionOverwrites.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCase) : undefined,
          deny: o.deny ? o.deny.map(toPascalCase) : undefined,
        }));
      }
      // Map type to Discord.js channel type
      let discordType = 0; // Default to text
      if (type === 'category') discordType = 4;
      const options = {
        type: discordType,
        name,
        topic: discordType === 0 ? topic : undefined,
        nsfw: discordType === 0 ? nsfw : undefined,
        parent: discordType === 0 ? parentId : undefined,
        position,
        rateLimitPerUser: discordType === 0 ? rateLimitPerUser : undefined,
        permissionOverwrites: processedPermissionOverwrites,
      };
      // Remove undefined, null, empty string, empty array, or 0 (for optional fields) from options
      Object.keys(options).forEach(key => {
        const val = options[key];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'number' && val === 0 && !['position', 'rateLimitPerUser'].includes(key))
        ) {
          delete options[key];
        }
      });
      let channel;
      try {
        channel = await guild.channels.create(options);
      } catch (err) {
        throw new Error('Failed to create channel: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, channelId: channel.id, type }, null, 2) },
        ],
      };
    }
  );
}
