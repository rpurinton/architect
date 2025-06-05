import { z } from 'zod';

// Tool: list-webhooks
// Lists all webhooks for a guild, or for a specified channel if channelId is provided.
export default async function (server, toolName = 'list-webhooks') {
  server.tool(
    toolName,
    'List all webhooks for a guild, or for a specified channel.',
    {
      guildId: z.string(),
      channelId: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let webhooks = [];
      try {
        if (channelId) {
          const channel = guild.channels.cache.get(channelId);
          if (!channel || typeof channel.fetchWebhooks !== 'function') throw new Error('Channel not found or cannot fetch webhooks.');
          const fetched = await channel.fetchWebhooks();
          webhooks = Array.from(fetched.values());
        } else {
          const fetched = await guild.fetchWebhooks();
          webhooks = Array.from(fetched.values());
        }
      } catch (err) {
        throw new Error('Failed to fetch webhooks: ' + (err.message || err));
      }
      const webhookList = webhooks.map(wh => ({
        id: wh.id,
        name: wh.name,
        channelId: wh.channelId,
        url: wh.url,
        type: wh.type,
        createdAt: wh.createdAt,
        creator: wh.owner ? `${wh.owner.username}#${wh.owner.discriminator}` : undefined,
        avatar: wh.avatar,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(webhookList, null, 2) },
        ],
      };
    }
  );
}
