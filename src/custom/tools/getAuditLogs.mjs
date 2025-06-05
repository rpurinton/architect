import { z } from 'zod';

// Tool: get-audit-logs
// Retrieves audit log entries for a guild, filterable by action, user, or time.
export default async function (server, toolName = 'get-audit-logs') {
  server.tool(
    toolName,
    'Retrieve audit log entries filtered by action, user, or time.',
    {
      guildId: z.string(),
      actionType: z.number().optional(), // Discord AuditLogEvent type
      userId: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
      before: z.string().optional(), // Entry ID to fetch logs before
    },
    async (args, extra) => {
      const { guildId, actionType, userId, limit = 50, before } = args;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error('Guild not found. Try list-guilds first.');
      let options = { limit };
      if (actionType !== undefined) options.type = actionType;
      if (userId !== undefined) options.user = userId;
      if (before !== undefined) options.before = before;
      let logs;
      try {
        logs = await guild.fetchAuditLogs(options);
      } catch (err) {
        throw new Error('Failed to fetch audit logs: ' + (err.message || err));
      }
      const entries = Array.from(logs.entries.values()).map(entry => ({
        id: entry.id,
        action: entry.action,
        actionType: entry.actionType,
        targetType: entry.targetType,
        targetId: entry.targetId,
        executor: entry.executor ? {
          id: entry.executor.id,
          username: entry.executor.username,
          discriminator: entry.executor.discriminator,
        } : undefined,
        reason: entry.reason,
        changes: entry.changes,
        createdAt: entry.createdAt,
      }));
      return {
        content: [
          { type: 'text', text: JSON.stringify(entries, null, 2) },
        ],
      };
    }
  );
}
