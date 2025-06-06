import { z } from 'zod';

// Tool: set-permissions
// Sets permission overrides for one or more channels, with merge or replace option.
export default async function (server, toolName = 'discord-set-permissions') {
  server.tool(
    toolName,
    'Set permission overrides for one or more channels. Optionally merge with existing overrides or replace them entirely.',
    {
      guildId: z.string(),
      channels: z.array(z.object({
        channelId: z.string(),
        overrides: z.array(z.object({
          id: z.string(),
          type: z.enum(['role', 'member']),
          allow: z.array(z.string()).optional(),
          deny: z.array(z.string()).optional(),
        })),
      })),
      merge: z.boolean().optional().describe('If true, merge with existing overrides. If false, replace all overrides.'),
      reason: z.string().optional(),
    },
    async ({ guildId, channels, merge = false, reason }, _extra) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      const results = [];
      for (const { channelId, overrides } of channels) {
        let channel = guild.channels.cache.get(channelId);
        if (!channel) {
          channel = await guild.channels.fetch(channelId).catch(() => null);
        }
        if (!channel) {
          results.push({ channelId, error: 'Channel not found.' });
          continue;
        }
        let newOverrides = overrides;
        if (merge) {
          // Merge: keep existing overrides not specified in new overrides
          const existing = channel.permissionOverwrites?.cache || [];
          const existingMap = new Map();
          for (const po of existing.values()) {
            existingMap.set(po.id + ':' + po.type, po);
          }
          // Build a map for new overrides
          const newMap = new Map();
          for (const o of overrides) {
            newMap.set(o.id + ':' + o.type, o);
          }
          // Add existing overrides not present in new overrides
          for (const [key, po] of existingMap.entries()) {
            if (!newMap.has(key)) {
              newOverrides.push({
                id: po.id,
                type: po.type === 0 ? 'role' : 'member',
                allow: po.allow?.toArray?.() || [],
                deny: po.deny?.toArray?.() || [],
              });
            }
          }
        }
        try {
          await channel.permissionOverwrites.set(newOverrides, { reason });
          results.push({ channelId, success: true });
        } catch (err) {
          results.push({ channelId, error: err.message || err });
        }
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ results }, null, 2) },
        ],
      };
    }
  );
}
