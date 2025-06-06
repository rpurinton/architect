import { z } from 'zod';

// Tool: create-text-channel
// Creates a new text channel in a specified guild and (optionally) category.
export default async function (server, toolName = 'discord-create-text-channel') {
  server.tool(
    toolName,
    'Create a new text channel under a specified category.',
    {
      guildId: z.string(),
      name: z.string(),
      parentId: z.string().optional(), // category ID
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
      const { guildId, name, parentId, topic, nsfw, position, rateLimitPerUser, permissionOverwrites } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      // Helper to convert ALL_CAPS permission names to PascalCase
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
      const options = {
        type: 0, // 0 = GUILD_TEXT
        name,
        topic,
        nsfw,
        parent: parentId,
        position,
        rateLimitPerUser,
        permissionOverwrites: processedPermissionOverwrites,
      };
      // Remove undefined fields
      Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);
      let channel;
      try {
        channel = await guild.channels.create(options);
      } catch (err) {
        throw new Error('Failed to create text channel: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, channelId: channel.id }, null, 2) },
        ],
      };
    }
  );
}
