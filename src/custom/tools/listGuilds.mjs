export default async function (server, toolName = 'discord-list-guilds') {
  // server.tool(
  //   toolName,
  //   'Returns a list of guilds the bot is in.',
  //   {},
  //   async (args, extra) => {
  //     const guilds = global.client.guilds.cache.map(guild => ({
  //       id: guild.id,
  //       name: guild.name,
  //     }));
  //     return {
  //       content: [
  //         {
  //           type: "text",
  //           text: JSON.stringify({ guilds }, null, 2),
  //         },
  //       ],
  //     };
  //   }
  // );
}
