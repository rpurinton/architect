import { z } from 'zod';

// Tool: set-permissions
// Sets permission overrides for one or more channels, with merge or replace option.
export default async function (server, toolName = 'discord-set-permissions') {
  server.tool(
    toolName,
    'Set permission overrides for one or more channels. Optionally merge with existing overrides or replace them entirely. Permission names in allow/deny will be auto-converted from ALL_CAPS to Discord.js PascalCase if needed.',
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
      // Helper to convert ALL_CAPS permission names to PascalCase
      function toPascalCase(perm) {
        if (!perm) return perm;
        if (/^[A-Z0-9_]+$/.test(perm)) {
          return perm.toLowerCase().replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
        }
        return perm;
      }
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
        // Convert permission names in allow/deny arrays
        let newOverrides = overrides.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCase) : undefined,
          deny: o.deny ? o.deny.map(toPascalCase) : undefined,
        }));
        if (merge) {
          // Merge: keep existing overrides not specified in new overrides
          const existing = channel.permissionOverwrites?.cache || [];
          const existingMap = new Map();
          for (const po of existing.values()) {
            existingMap.set(po.id + ':' + po.type, po);
          }
          // Build a map for new overrides
          const newMap = new Map();
          for (const o of newOverrides) {
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
