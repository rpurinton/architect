import { z } from 'zod';

export default async function (server, toolName = 'who-am-i') {
  server.tool(
    toolName,
    "Returns the bot's own user record, including all available properties.",
    {},
    async (_args, _extra) => {
      const user = global.client.user;
      if (!user) throw new Error('Bot user not found.');
      const userInfo = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        tag: user.tag,
        avatar: user.displayAvatarURL?.({ dynamic: true, size: 1024 }),
        bot: user.bot,
        createdAt: user.createdAt,
        system: user.system,
        flags: user.flags?.toArray?.() || undefined,
      };
      // Remove undefined/null fields for cleanliness
      const cleanUserInfo = Object.fromEntries(Object.entries(userInfo).filter(([_, v]) => v !== undefined && v !== null));
      return {
        content: [
          { type: 'text', text: JSON.stringify(cleanUserInfo, null, 2) },
        ],
      };
    }
  );
}
