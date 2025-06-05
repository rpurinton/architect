import { z } from 'zod';

// Tool: create-sticker
// Creates a sticker in a guild.
export default async function (server, toolName = 'create-sticker') {
  server.tool(
    toolName,
    'Create a sticker in a guild.',
    {
      guildId: z.string(),
      name: z.string(),
      description: z.string(),
      tags: z.string(),
      file: z.string(), // URL or base64
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, ...stickerData } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      let sticker;
      try {
        sticker = await guild.stickers.create(stickerData);
      } catch (err) {
        throw new Error('Failed to create sticker: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, stickerId: sticker.id }, null, 2) },
        ],
      };
    }
  );
}
