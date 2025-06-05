import { z } from 'zod';

// Tool: delete-emoji
// Deletes a custom emoji from a guild.
export default async function (server, toolName = 'delete-emoji') {
  server.tool(
    toolName,
    'Remove a custom emoji from the guild.',
    {
      guildId: z.string(),
      emojiId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, emojiId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      const emoji = guild.emojis.cache.get(emojiId);
      if (!emoji) throw new Error('Emoji not found. Please re-run with a valid Emoji ID.');
      try {
        await emoji.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete emoji: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, emojiId }, null, 2) },
        ],
      };
    }
  );
}
