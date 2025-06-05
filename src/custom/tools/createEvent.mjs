import { z } from 'zod';

// Tool: create-event
// Creates a scheduled event in a guild.
export default async function (server, toolName = 'create-event') {
  server.tool(
    toolName,
    'Create a scheduled event in a guild.',
    {
      guildId: z.string(),
      name: z.string(),
      scheduledStartTime: z.string(), // ISO8601
      scheduledEndTime: z.string().optional(), // ISO8601
      description: z.string().optional(),
      entityType: z.number(), // 1: Stage, 2: Voice, 3: External
      channelId: z.string().optional(),
      privacyLevel: z.number().optional(),
      reason: z.string().optional(),
    },
    async (args, extra) => {
      const { guildId, ...eventData } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let event;
      try {
        event = await guild.scheduledEvents.create(eventData);
      } catch (err) {
        throw new Error('Failed to create event: ' + (err.message || err));
      }
      return {
        content: [
          { type: 'text', text: JSON.stringify({ success: true, eventId: event.id }, null, 2) },
        ],
      };
    }
  );
}
