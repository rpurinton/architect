import { z } from 'zod';

// Tool: update-event
// Updates a scheduled event in a guild.
export default async function (server, toolName = 'update-event') {
  server.tool(
    toolName,
    'Update a scheduled event in a guild.',
    {
      guildId: z.string(),
      eventId: z.string(),
      name: z.string().optional(),
      scheduledStartTime: z.string().optional(),
      scheduledEndTime: z.string().optional(),
      description: z.string().optional(),
      entityType: z.number().optional(),
      channelId: z.string().optional(),
      privacyLevel: z.number().optional(),
      status: z.number().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, eventId, ...updateFields } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let event;
      try {
        event = await guild.scheduledEvents.fetch(eventId);
        await event.edit(updateFields);
      } catch (err) {
        throw new Error('Failed to update event: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, eventId }, null, 2) },
        ],
      };
    }
  );
}
