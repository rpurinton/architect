import { z } from 'zod';

// Tool: update-permission-overrides
// Modifies permission overrides for a channel or category in a guild, validates IDs, returns updated overrides.
export default async function (server, toolName = 'update-permission-overrides') {
  server.tool(
    toolName,
    'Modify permission overrides for a channel or category. Validates IDs and returns updated overrides.',
    {
      guildId: z.string(),
      channelId: z.string(),
      overrides: z.array(z.object({
        id: z.string(),
        type: z.enum(['role', 'member']),
        allow: z.array(z.string()).optional(),
        deny: z.array(z.string()).optional(),
      })),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, overrides, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let channel = guild.channels.cache.get(channelId);
      if (!channel) {
        channel = await guild.channels.fetch(channelId).catch(() => null);
      }
      if (!channel) throw new Error('Channel not found.  Try list-channels first.');
      // Validate override IDs
      for (const o of overrides) {
        if (o.type === 'role' && !guild.roles.cache.has(o.id)) {
          throw new Error(`Role ID ${o.id} is invalid for this guild.`);
        }
        if (o.type === 'member' && !guild.members.cache.has(o.id)) {
          throw new Error(`Member ID ${o.id} is invalid for this guild.`);
        }
      }
      try {
        await channel.permissionOverwrites.set(overrides, { reason });
      } catch (err) {
        throw new Error('Failed to update permission overrides: ' + (err.message || err));
      }
      // Return updated overrides
      const updated = channel.permissionOverwrites?.cache?.map(po => ({
        id: po.id,
        type: po.type,
        allow: po.allow?.toArray?.() || [],
        deny: po.deny?.toArray?.() || [],
      })) || [];
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, channelId, overrides: updated }, null, 2) },
        ],
      };
    }
  );
}
