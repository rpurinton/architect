import { z } from 'zod';

const getMemberRequestSchema = z.object({ guildId: z.string(), memberId: z.string() });
const getMemberResponseSchema = z.object({ member: z.any() });

export function getMemberTool(server, toolName = 'get-member') {
  server.tool(
    toolName,
    'Returns all details about a given member.',
    getMemberRequestSchema,
    async ({ guildId, memberId }) => {
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found');
      const member = guild.members.cache.get(memberId);
      if (!member) throw new Error('Member not found');
      const response = getMemberResponseSchema.parse({ member });
      return {
        content: [
          { type: 'text', text: JSON.stringify(response, null, 2) },
        ],
      };
    }
  );
}

export default getMemberTool;
