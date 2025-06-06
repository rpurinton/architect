import { z } from 'zod';

// Tool: get-permission-overrides
// Fetches permission overrides for a channel or category in a guild.
export default async function (server, toolName = 'discord-get-permission-overrides') {
  server.tool(
    toolName,
    'Fetch permission overrides for a channel or category.',
    {
      guildId: z.string(),
      channelId: z.string(),
    },
    async (args, extra) => {
      const { guildId, channelId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel) throw new Error('Channel not found.  Try discord-list-channels first.');
      const overrides = channel.permissionOverwrites?.cache?.map(po => ({
        id: po.id,
        type: po.type,
        allow: po.allow?.toArray?.() || [],
        deny: po.deny?.toArray?.() || [],
      })) || [];
      return {
        content: [
          { type: 'text', text: JSON.stringify(overrides, null, 2) },
        ],
      };
    }
  );
}
