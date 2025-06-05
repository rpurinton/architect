import { z } from 'zod';

// Tool: list-stickers
// Lists all stickers in a guild.
export default async function (server, toolName = 'list-stickers') {
  server.tool(
    toolName,
    'List all stickers in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      let stickers;
      try {
        stickers = await guild.stickers.fetch();
      } catch (err) {
        throw new Error('Failed to fetch stickers: ' + (err.message || err));
      }
      const stickerList = Array.from(stickers.values()).map(st => ({
        id: st.id,
        name: st.name,
        description: st.description,
        formatType: st.format,
        tags: st.tags,
        available: st.available,
        url: st.url,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(stickerList, null, 2) },
        ],
      };
    }
  );
}
