import { jest } from '@jest/globals';
import * as toolHelpers from '../../src/custom/toolHelpers.mjs';

describe('toolHelpers', () => {
  describe('getGuild', () => {
    it('returns guild if found', () => {
      global.discord = { guilds: { cache: new Map([['123', { id: '123' }]]) } };
      expect(toolHelpers.getGuild('123')).toEqual({ id: '123' });
    });
    it('throws if not found', () => {
      global.discord = { guilds: { cache: new Map() } };
      expect(() => toolHelpers.getGuild('notfound')).toThrow('Guild not found.');
    });
  });

  describe('cleanOptions', () => {
    it('removes undefined, null, empty string, and empty arrays', () => {
      const input = { a: undefined, b: null, c: '', d: [], e: [1, null, 2], f: { g: '' }, h: 'ok' };
      expect(toolHelpers.cleanOptions(input)).toEqual({ e: [1,2], h: 'ok' });
    });
    it('returns undefined for empty object/array', () => {
      expect(toolHelpers.cleanOptions({})).toBeUndefined();
      expect(toolHelpers.cleanOptions([])).toBeUndefined();
    });
  });

  describe('toPascalCasePerms', () => {
    it('converts ALL_CAPS to PascalCase', () => {
      expect(toolHelpers.toPascalCasePerms('SEND_MESSAGES')).toBe('SendMessages');
      expect(toolHelpers.toPascalCasePerms('MANAGE_CHANNELS')).toBe('ManageChannels');
    });
    it('returns non-string as is', () => {
      expect(toolHelpers.toPascalCasePerms(123)).toBe(123);
    });
  });

  describe('buildResponse', () => {
    it('wraps data in content array', () => {
      const data = { foo: 'bar' };
      const res = toolHelpers.buildResponse(data);
      expect(res).toEqual({ content: [ { type: 'text', text: JSON.stringify(data, null, 2) } ] });
    });
  });

  describe('wrapAction', () => {
    it('wraps action and builds response', async () => {
      const action = jest.fn(async (args) => ({ ok: args }));
      const wrapped = toolHelpers.wrapAction(action);
      const result = await wrapped('test');
      expect(result.content[0].text).toContain('ok');
    });
  });

  describe('mergePermissionOverwrites', () => {
    it('merges new and existing overwrites if merge=true', () => {
      const existing = { cache: new Map([
        ['1', { id: '1', type: 0, allow: { toArray: () => ['SEND_MESSAGES'] }, deny: { toArray: () => [] } }]
      ]) };
      const newOvr = [{ id: '2', type: 'role', allow: ['SEND_MESSAGES'], deny: [] }];
      const merged = toolHelpers.mergePermissionOverwrites(existing, newOvr, true);
      expect(merged.length).toBe(2);
      expect(merged.some(o => o.id === '1')).toBe(true);
      expect(merged.some(o => o.id === '2')).toBe(true);
    });
    it('only uses new if merge=false', () => {
      const existing = { cache: new Map([
        ['1', { id: '1', type: 0, allow: { toArray: () => ['SEND_MESSAGES'] }, deny: { toArray: () => [] } }]
      ]) };
      const newOvr = [{ id: '2', type: 'role', allow: ['SEND_MESSAGES'], deny: [] }];
      const merged = toolHelpers.mergePermissionOverwrites(existing, newOvr, false);
      expect(merged.length).toBe(1);
      expect(merged[0].id).toBe('2');
    });
  });

  describe('ensureArrayOfIds', () => {
    it('returns valid ids', () => {
      const guild = { roles: { cache: new Map([['1', {}], ['2', {}]]) }, channels: { cache: new Map([['a', {}]]) } };
      expect(toolHelpers.ensureArrayOfIds(guild, ['1', '2'], 'role')).toEqual(['1', '2']);
      expect(toolHelpers.ensureArrayOfIds(guild, ['a'], 'channel')).toEqual(['a']);
    });
    it('throws if any id is invalid', () => {
      const guild = { roles: { cache: new Map([['1', {}]]) }, channels: { cache: new Map([['a', {}]]) } };
      expect(() => toolHelpers.ensureArrayOfIds(guild, ['1', 'x'], 'role')).toThrow();
      expect(() => toolHelpers.ensureArrayOfIds(guild, ['a', 'b'], 'channel')).toThrow();
    });
  });
});
