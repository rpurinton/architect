import { z } from 'zod';

// Tool: delete-webhook
// Deletes a webhook by its ID.
export default async function (server, toolName = 'discord-delete-webhook') {
  server.tool(
    toolName,
    'Delete a webhook by its ID.',
    {
      guildId: z.string(),
      webhookId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, webhookId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      let webhook;
      try {
        webhook = await guild.fetchWebhook(webhookId);
        if (!webhook) throw new Error('Webhook not found.');
        await webhook.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete webhook: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, webhookId }, null, 2) },
        ],
      };
    }
  );
}
