import { z } from 'zod';

// Tool: create-voice-channel
// Creates a new voice channel in a specified guild and (optionally) category.
export default async function (server, toolName = 'discord-create-voice-channel') {
  server.tool(
    toolName,
    'Create a new voice channel under a specified category.',
    {
      guildId: z.string(),
      name: z.string(),
      parentId: z.string().optional(), // category ID
      bitrate: z.number().optional(),
      userLimit: z.number().optional(),
      rtcRegion: z.string().optional(),
      position: z.number().optional(),
      permissionOverwrites: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })).optional(),
    },
    async (args, extra) => {
      const { guildId, name, parentId, bitrate, userLimit, rtcRegion, position, permissionOverwrites } = args;
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
      const options = {
        type: 2, // 2 = GUILD_VOICE
        name,
        parent: parentId,
        bitrate,
        userLimit,
        rtcRegion,
        position,
        permissionOverwrites: processedPermissionOverwrites,
      };
      Object.keys(options).forEach(key => {
        const val = options[key];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'number' && val === 0 && !['position','userLimit','bitrate'].includes(key))
        ) {
          delete options[key];
        }
      });
      let channel;
      try {
        channel = await guild.channels.create(options);
      } catch (err) {
        throw new Error('Failed to create voice channel: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, channelId: channel.id }, null, 2) },
        ],
      };
    }
  );
}
