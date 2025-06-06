import { z } from 'zod';

// Tool: create-emoji
// Uploads a new custom emoji to a guild.
export default async function (server, toolName = 'discord-create-emoji') {
  server.tool(
    toolName,
    'Upload a new custom emoji to the guild.',
    {
      guildId: z.string(),
      name: z.string(),
      image: z.string(), // URL or base64
      roles: z.array(z.string()).optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, name, image, roles, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
      let emoji;
      try {
        emoji = await guild.emojis.create({ name, attachment: image, roles, reason });
      } catch (err) {
        throw new Error('Failed to create emoji: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, emojiId: emoji.id, name: emoji.name }, null, 2) },
        ],
      };
    }
  );
}
