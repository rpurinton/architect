import { z } from 'zod';

const listMembersRequestSchema = z.object({ guildId: z.string() });
const listMembersResponseSchema = z.object({
  members: z.array(z.object({ id: z.string(), username: z.string(), discriminator: z.string() })),
});

export function listMembersTool(server, toolName = 'list-members') {
  server.tool(
    toolName,
    'Returns a list of members in a guild.',
    listMembersRequestSchema,
    async ({ guildId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const members = guild.members.cache.map(member => ({
        id: member.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
      }));
      const response = listMembersResponseSchema.parse({ members });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default listMembersTool;
