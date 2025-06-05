import { z } from 'zod';

// Tool: delete-sticker
// Deletes a sticker from a guild.
export default async function (server, toolName = 'delete-sticker') {
  server.tool(
    toolName,
    'Delete a sticker from a guild.',
    {
      guildId: z.string(),
      stickerId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, stickerId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      let sticker;
      try {
        sticker = await guild.stickers.fetch(stickerId);
        await sticker.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete sticker: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, stickerId }, null, 2) },
        ],
      };
    }
  );
}
