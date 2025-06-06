import { z } from 'zod';

// Tool: send-message
// Sends a message to a specified channel in a guild.
export default async function (server, toolName = 'discord-send-message') {
    server.tool(
        toolName,
        'Send a message to a channel.',
        {
            guildId: z.string(),
            channelId: z.string(),
            content: z.string().min(0).max(2000).optional(),
            embed: z.preprocess(
                (v) => v === null ? undefined : v,
                z.object({
                    title: z.string().optional(),
                    description: z.string().optional(),
                    url: z.string().optional(),
                    color: z.number().optional(),
                    fields: z.array(z.object({
                        name: z.string(),
                        value: z.string(),
                        inline: z.boolean().optional(),
                    })).optional(),
                    footer: z.object({ text: z.string(), icon_url: z.string().optional() }).optional(),
                    image: z.object({ url: z.string() }).optional(),
                    thumbnail: z.object({ url: z.string() }).optional(),
                    author: z.object({ name: z.string(), icon_url: z.string().optional(), url: z.string().optional() }).optional(),
                    timestamp: z.string().optional(),
                }).optional()
            ),
            // Add more message options as needed
        },
        async (args, extra) => {
            const { guildId, channelId, content, embed } = args;
            const guild = global.client.guilds.cache.get(guildId);
            if (!guild) throw new Error('Guild not found. Try discord-list-guilds first.');
            const channel = guild.channels.cache.get(channelId);
            if (!channel || typeof channel.send !== 'function') throw new Error('Channel not found or cannot send messages to this channel.');
            if (!content && !embed) throw new Error('Either content or embed must be provided.');

            let messagePayload = {};
            if (content) messagePayload.content = content;
            if (embed) messagePayload.embeds = [embed];

            let sentMessage;
            try {
                sentMessage = await channel.send(messagePayload);
            } catch (err) {
                throw new Error('Failed to send message: ' + (err.message || err));
            }

            return {
                content: [
                    { type: 'text', text: JSON.stringify({ success: true, messageId: sentMessage.id }, null, 2) },
                ],
            };
        }
    );
}
