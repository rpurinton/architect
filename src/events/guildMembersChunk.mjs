import log from '../log.mjs';
import { getMsg } from '../locales.mjs';

// Event handler for guildMembersChunk
export default async function (members, guild, chunk) {
    log.debug('guildMembersChunk', {
        guildId: guild.id,
        chunkSize: chunk.length,
        totalMembers: members.size,
    });
}
