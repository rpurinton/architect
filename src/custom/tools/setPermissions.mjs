import { z } from 'zod';
import { getGuild, getChannel, mergePermissionOverwrites, buildResponse, toPascalCasePerms } from '../toolHelpers.mjs';

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
      const guild = getGuild(guildId);
      const results = [];
      for (const { channelId, overrides } of channels) {
        let channel;
        try {
          channel = await getChannel(guild, channelId);
        } catch (err) {
          results.push({ channelId, error: 'Channel not found.' });
          continue;
        }
        let newOverrides = overrides.map(o => ({
          ...o,
          allow: o.allow ? o.allow.map(toPascalCasePerms) : undefined,
          deny: o.deny ? o.deny.map(toPascalCasePerms) : undefined,
        }));
        newOverrides = mergePermissionOverwrites(channel.permissionOverwrites, newOverrides, merge);
        try {
          await channel.permissionOverwrites.set(newOverrides, { reason });
          results.push({ channelId, success: true });
        } catch (err) {
          results.push({ channelId, error: err.message || err });
        }
      }
      return buildResponse({ results });
    }
  );
}
