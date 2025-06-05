import { z } from 'zod';

// Tool: list-events
// Lists all scheduled events in a guild.
export default async function (server, toolName = 'list-events') {
  server.tool(
    toolName,
    'List all scheduled events in a guild.',
    {
      guildId: z.string(),
    },
    async (args, extra) => {
      const { guildId } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let events;
      try {
        events = await guild.scheduledEvents.fetch();
      } catch (err) {
        throw new Error('Failed to fetch events: ' + (err.message || err));
      }
      const eventList = Array.from(events.values()).map(ev => ({
        id: ev.id,
        name: ev.name,
        description: ev.description,
        scheduledStartTime: ev.scheduledStartTimestamp,
        scheduledEndTime: ev.scheduledEndTimestamp,
        status: ev.status,
        entityType: ev.entityType,
        channelId: ev.channelId,
        creatorId: ev.creatorId,
        privacyLevel: ev.privacyLevel,
        userCount: ev.userCount,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(eventList, null, 2) },
        ],
      };
    }
  );
}
