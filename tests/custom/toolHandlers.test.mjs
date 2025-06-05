import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

describe('All custom tool handler files export a default function', () => {
  const toolsDir = path.join(process.cwd(), 'src', 'custom', 'tools');
  const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.mjs'));
  for (const file of files) {
    const filePath = path.join(toolsDir, file);
    test(`${file} exports a default function`, async () => {
      const mod = await import(filePath);
      expect(typeof mod.default).toBe('function');
    });
  }
});
