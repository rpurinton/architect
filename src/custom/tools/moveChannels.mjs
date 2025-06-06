import { z } from 'zod';

export default async function (server, toolName = 'discord-move-channels') {
  server.tool(
    toolName,
    'Moves the provided list of channels to the specified category (parentId) in a single batch.',
    {
      guildId: z.string().describe('The ID of the guild.'),
      parentId: z.string().describe('The ID of the category to move channels into.'),
      channelIds: z.array(z.string()).describe('The list of channel IDs to move.'),
    },
    async ({ guildId, parentId, channelIds }, _extra) => {
      const guild = await global.client.guilds.fetch(guildId);
      if (!guild) throw new Error('Guild not found.');
      const channels = guild.channels.cache;
      // Validate all provided IDs exist
      for (const id of channelIds) {
        if (!channels.has(id)) throw new Error(`Channel ID not found in guild: ${id}.  Try discord-list-channels first.`);
      }
      // Validate parent is a category
      const parent = channels.get(parentId);
      if (!parent || parent.type !== 4) throw new Error('parentId is not a valid category channel');
      // Move each channel to the new parent
      for (const id of channelIds) {
        const channel = channels.get(id);
        if (!channel) continue;
        await channel.edit({ parent: parentId });
      }
      return {
        content: [
          { type: 'text', text: `Moved ${channelIds.length} channels to category ${parentId} in guild ${guildId}.` },
        ],
      };
    }
  );
}
