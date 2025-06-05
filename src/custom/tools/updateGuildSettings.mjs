import { z } from 'zod';

// Tool: update-guild-settings
// Allows updating all possible guild-wide settings via Discord.js Guild.edit()
export default async function (server, toolName = 'update-guild-settings') {
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
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');

      const updateData = { ...rest };
      if (defaultMessageNotifications !== undefined) {
        updateData.defaultMessageNotifications =
          defaultMessageNotifications === 'ALL_MESSAGES' ? 0 : 1;
      }
      if (systemChannelFlags !== undefined) {
        // Discord.js expects a bitfield, but we allow an array of flag names for convenience
        // If user provides a number, use as-is; if array, convert using Discord.js SystemChannelFlags
        const { SystemChannelFlags } = require('discord.js');
        if (Array.isArray(systemChannelFlags)) {
          updateData.systemChannelFlags = systemChannelFlags.reduce((acc, flag) => {
            if (SystemChannelFlags[flag]) return acc | SystemChannelFlags[flag];
            return acc;
          }, 0);
        } else {
          updateData.systemChannelFlags = systemChannelFlags;
        }
      }

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
