import log from '../log.mjs';
import { getMsg } from '../locales.mjs';

// Event handler for guildMembersChunk
export default async function (members, guild, chunk) {
    //log.debug('guildMembersChunk', { members, guild, chunk });
    log.debug('guildMembersChunk', { chunkCount: chunk.length });
}
