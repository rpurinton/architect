import { z } from 'zod';
import { Guild } from 'discord.js';

// Tool: update-guild-settings
// Allows updating all possible guild-wide settings via Discord.js Guild.edit()
export default async function (server, toolName = 'discord-update-guild-settings') {
  server.tool(
    toolName,
    'Modify any guild-wide settings supported by Discord.js Guild.edit().',
    {
      guildId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(), // base64 or URL
      banner: z.string().optional(), // base64 or URL
      splash: z.string().optional(), // base64 or URL
      discoverySplash: z.string().optional(), // base64 or URL
      afkChannelId: z.string().optional(),
      afkTimeout: z.number().optional(),
      systemChannelId: z.string().optional(),
      systemChannelFlags: z.array(z.string()).optional(),
      verificationLevel: z.number().optional(),
      explicitContentFilter: z.number().optional(),
      defaultMessageNotifications: z.enum(['ALL_MESSAGES', 'ONLY_MENTIONS']).optional(),
      mfaLevel: z.number().optional(),
      nsfwLevel: z.number().optional(),
      preferredLocale: z.string().optional(),
      premiumProgressBarEnabled: z.boolean().optional(),
      rulesChannelId: z.string().optional(),
      publicUpdatesChannelId: z.string().optional(),
      safetyAlertsChannelId: z.string().optional(),
      // Add more as needed from Discord.js Guild.edit() docs
    },
    async (args, extra) => {
      const { guildId, defaultMessageNotifications, systemChannelFlags, ...rest } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');

      const updateData = { ...rest };
      if (defaultMessageNotifications !== undefined) {
        updateData.defaultMessageNotifications =
          defaultMessageNotifications === 'ALL_MESSAGES' ? 0 : 1;
      }
      if (systemChannelFlags !== undefined) {
        // Discord.js expects a bitfield, but we allow an array of flag names for convenience
        // If user provides a number, use as-is; if array, convert using Discord.js Guild.SystemChannelFlags
        if (Array.isArray(systemChannelFlags)) {
          updateData.systemChannelFlags = systemChannelFlags.reduce((acc, flag) => {
            if (Guild.SystemChannelFlags[flag]) return acc | Guild.SystemChannelFlags[flag];
            return acc;
          }, 0);
        } else {
          updateData.systemChannelFlags = systemChannelFlags;
        }
      }

      // Remove undefined, null, empty string, empty array, or 0 (for optional fields) from updateData
      Object.keys(updateData).forEach(key => {
        const val = updateData[key];
        if (
          val === undefined ||
          val === null ||
          (typeof val === 'string' && val.trim() === '') ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'number' && val === 0 && !['afkTimeout','verificationLevel','explicitContentFilter','mfaLevel','nsfwLevel','premiumProgressBarEnabled'].includes(key))
        ) {
          delete updateData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        throw new Error('No settings provided to update.');
      }

      let updatedGuild;
      try {
        updatedGuild = await guild.edit(updateData);
      } catch (err) {
        throw new Error('Failed to update guild settings: ' + (err.message || err));
      }

      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, updated: updateData }, null, 2) },
        ],
      };
    }
  );
}
