// Tests for mcpClient.mjs
import { initializeMcpClient } from '../../src/custom/mcpClient.mjs';
import { jest } from '@jest/globals';

describe('initializeMcpClient', () => {
  let mockLog, mockClient, mockTransport;
  beforeEach(() => {
    mockLog = { info: jest.fn(), error: jest.fn() };
    mockClient = jest.fn().mockImplementation(() => ({ connect: jest.fn().mockResolvedValue(), }));
    mockTransport = jest.fn().mockImplementation(() => ({ on: jest.fn() }));
  });

  it('should initialize and connect MCP client', async () => {
    const client = await initializeMcpClient({
      log: mockLog,
      port: 1234,
      baseUrl: 'http://localhost:1234/mcp',
      ClientClass: mockClient,
      TransportClass: mockTransport,
    });
    expect(client).toBeDefined();
    expect(mockLog.info).toHaveBeenCalledWith('MCP Client initialized connecting to http://localhost:1234/mcp');
  });
});
