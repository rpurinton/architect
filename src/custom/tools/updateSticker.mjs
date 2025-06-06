import { z } from 'zod';

// Tool: update-sticker
// Updates a sticker in a guild.
export default async function (server, toolName = 'discord-update-sticker') {
  server.tool(
    toolName,
    'Update a sticker in a guild.',
    {
      guildId: z.string(),
      stickerId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      tags: z.string().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, stickerId, ...updateFields } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found.');
      let sticker;
      try {
        sticker = await guild.stickers.fetch(stickerId);
        await sticker.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update sticker: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, stickerId }, null, 2) },
        ],
      };
    }
  );
}
