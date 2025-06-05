import { z } from 'zod';

// Tool: delete-event
// Deletes a scheduled event in a guild.
export default async function (server, toolName = 'delete-event') {
  server.tool(
    toolName,
    'Delete a scheduled event in a guild.',
    {
      guildId: z.string(),
      eventId: z.string(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, eventId, reason } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Please re-run with a valid Guild ID.');
      let event;
      try {
        event = await guild.scheduledEvents.fetch(eventId);
        await event.delete(reason);
      } catch (err) {
        throw new Error('Failed to delete event: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, eventId }, null, 2) },
        ],
      };
    }
  );
}
