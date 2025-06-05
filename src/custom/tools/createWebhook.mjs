import { z } from 'zod';

// Tool: create-webhook
// Creates a webhook in a specified channel.
export default async function (server, toolName = 'create-webhook') {
  server.tool(
    toolName,
    'Create a webhook in a specified channel.',
    {
      guildId: z.string(),
      channelId: z.string(),
      name: z.string(),
      avatar: z.string().optional(), // URL or base64
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, channelId, name, avatar, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      const channel = guild.channels.cache.get(channelId);
      if (!channel || typeof channel.createWebhook !== 'function') throw new Error('Channel not found or cannot create webhooks.');
      let webhook;
      try {
        webhook = await channel.createWebhook({ name, avatar, reason });
      } catch (err) {
        throw new Error('Failed to create webhook: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, webhookId: webhook.id, url: webhook.url }, null, 2) },
        ],
      };
    }
  );
}
