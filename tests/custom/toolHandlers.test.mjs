import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

describe('All custom tool handler files', () => {
  const toolsDir = path.join(process.cwd(), 'src', 'custom', 'tools');
  const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.mjs'));

  for (const file of files) {
    const filePath = path.join(toolsDir, file);
    test(`${file} exports a default function`, async () => {
      const mod = await import(filePath);
      expect(typeof mod.default).toBe('function');
    });

    test(`${file} registers a tool with the server`, async () => {
      const onMock = jest.fn();
      const toolMock = jest.fn();
      const mockServer = { on: onMock, tool: toolMock };
      const mod = await import(filePath);
      await mod.default(mockServer, 'test-tool');
      expect(toolMock).toHaveBeenCalled();
    });
  }
});
