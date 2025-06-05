// Tests for mcpServer.mjs
import initializeMcpServer from '../../src/custom/mcpServer.mjs';
import { jest } from '@jest/globals';

describe('initializeMcpServer', () => {
  let mockTransport, mockLog, mockFs, mockPath, mockGetCurrentFilename, mockImportFn;
  beforeEach(() => {
    mockTransport = { connect: jest.fn().mockResolvedValue(), start: jest.fn() };
    mockLog = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    mockFs = { readdirSync: jest.fn(() => ['tool1.mjs', 'tool2.mjs']) };
    mockPath = { join: (...args) => args.join('/'), dirname: jest.fn(() => '/mockdir') };
    mockGetCurrentFilename = jest.fn(() => '/mockdir/file.mjs');
    mockImportFn = jest.fn(async (modPath) => ({ default: jest.fn() }));
    // Patch globalThis.log to ensure no fallback logger is used
    global.log = mockLog;
    global.import = mockImportFn;
  });

  afterEach(() => {
    delete global.import;
    delete global.log;
  });

  it('should initialize and connect MCP server, registering tools', async () => {
    const mcpServer = await initializeMcpServer(
      mockTransport,
      { url: 'mockmeta' },
      undefined,
      { log: mockLog, fsModule: mockFs, pathModule: mockPath, getCurrentFilenameFn: mockGetCurrentFilename, importFn: mockImportFn }
    );
    expect(mcpServer).toBeDefined();
    expect(mockLog.info).toHaveBeenCalledWith('Registered all MCP tools');
    expect(mockLog.debug).toHaveBeenCalledWith('Registered MCP tool from tool1.mjs');
    expect(mockLog.debug).toHaveBeenCalledWith('Registered MCP tool from tool2.mjs');
  });
});
