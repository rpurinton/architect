import { z } from 'zod';

export default async function (server, toolName = 'get-member') {
  server.tool(
    toolName,
    'Returns all available details about a given member, including all properties, roles, presence, and user info.',
    { guildId: z.string(), memberId: z.string() },
    async (args, extra) => {
      const guildId = args.guildId;
      const memberId = args.memberId;
      const guild = global.client.guilds.cache.get(guildId);
      if (!guild) throw new Error(`Guild not found. Provided: ${guildId}. Available: ${Array.from(global.client.guilds.cache.keys()).join(', ')}`);
      if (!memberId) throw new Error('Member ID is required');
      const member = guild.members.cache.get(memberId) || await guild.members.fetch(memberId).catch(() => null);
      if (!member) throw new Error(`Member not found. Provided: ${memberId}`);
      const user = member.user;
      // Debug log: raw presence info from Discord
      if (member.presence) {
        console.debug('[get-member] Raw presence from Discord:', JSON.stringify(member.presence, null, 2));
      } else {
        console.debug('[get-member] No presence info available for member:', memberId);
      }
      const presence = member.presence ? {
        status: member.presence.status,
        activities: member.presence.activities?.map(a => ({
          name: a.name,
          type: a.type,
          state: a.state,
          details: a.details,
          url: a.url,
        }))
      } : undefined;
      const memberInfo = {
        id: member.id,
        tag: user?.tag,
        username: user?.username,
        discriminator: user?.discriminator,
        bot: user?.bot,
        avatar: user?.displayAvatarURL?.({ dynamic: true, size: 1024 }),
        displayName: member.displayName || member.nickname || user?.username,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
        premiumSince: member.premiumSince,
        pending: member.pending,
        communicationDisabledUntil: member.communicationDisabledUntil,
        roles: member.roles.cache.map(r => ({
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position,
        })),
        user: user ? {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          tag: user.tag,
          avatar: user.displayAvatarURL?.({ dynamic: true, size: 1024 }),
          bot: user.bot,
          createdAt: user.createdAt,
        } : undefined,
        presence,
        deaf: member.deaf,
        mute: member.mute,
        bannable: member.bannable,
        kickable: member.kickable,
        manageable: member.manageable,
        voice: member.voice ? {
          channelId: member.voice.channelId,
          deaf: member.voice.deaf,
          mute: member.voice.mute,
          streaming: member.voice.streaming,
          selfDeaf: member.voice.selfDeaf,
          selfMute: member.voice.selfMute,
          sessionId: member.voice.sessionId,
        } : undefined,
        flags: member.flags?.toArray?.() || undefined,
      };
      // Remove undefined/null fields for cleanliness
      const cleanMemberInfo = Object.fromEntries(Object.entries(memberInfo).filter(([_, v]) => v !== undefined && v !== null));
      return {
        content: [
          { type: 'text', text: JSON.stringify(cleanMemberInfo, null, 2) },
        ],
      };
    }
  );
}
