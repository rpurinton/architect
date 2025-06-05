import { jest } from '@jest/globals';
import { setupShutdownHandlers } from '../src/shutdown.mjs';

describe('setupShutdownHandlers', () => {
  let processObj;
  let logger;
  let client;
  let mcpClient;
  let mcpServer;
  let serverInstance;
  let httpServer;
  beforeEach(() => {
    processObj = {
      on: jest.fn(),
      exit: jest.fn()
    };
    logger = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn()
    };
    client = { destroy: jest.fn().mockResolvedValue() };
    mcpClient = { close: jest.fn().mockResolvedValue() };
    mcpServer = { close: jest.fn().mockResolvedValue() };
    serverInstance = { close: jest.fn(cb => cb && cb()) };
    httpServer = { mcpServer, serverInstance };
  });

  it('registers signal handlers and returns shutdown/getShuttingDown', () => {
    const { shutdown, getShuttingDown } = setupShutdownHandlers({ processObj, logger, client, mcpClient, httpServer, signals: ['SIGINT'] });
    expect(processObj.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(typeof shutdown).toBe('function');
    expect(typeof getShuttingDown).toBe('function');
  });

  it('shutdown only runs once and calls all shutdown methods', async () => {
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, mcpClient, httpServer, signals: [] });
    await shutdown('SIGINT');
    expect(logger.info).toHaveBeenCalledWith('Received SIGINT. Shutting down gracefully...');
    expect(client.destroy).toHaveBeenCalled();
    expect(mcpClient.close).toHaveBeenCalled();
    expect(mcpServer.close).toHaveBeenCalled();
    expect(serverInstance.close).toHaveBeenCalled();
    expect(processObj.exit).toHaveBeenCalledWith(0);
    await shutdown('SIGINT');
    expect(logger.warn).toHaveBeenCalledWith('Received SIGINT again, but already shutting down.');
  });

  it('logs error if client.destroy throws', async () => {
    client.destroy.mockRejectedValue(new Error('fail'));
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, mcpClient, httpServer, signals: [] });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error during client shutdown:', expect.any(Error));
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });

  it('logs error if mcpClient.close throws', async () => {
    mcpClient.close.mockRejectedValue(new Error('fail-mcpClient'));
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, mcpClient, httpServer, signals: [] });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error during MCP client shutdown:', expect.any(Error));
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });

  it('logs error if mcpServer.close throws', async () => {
    mcpServer.close.mockRejectedValue(new Error('fail-mcpServer'));
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, mcpClient, httpServer, signals: [] });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error during MCP server shutdown:', expect.any(Error));
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });

  it('logs error if httpServer.serverInstance.close throws', async () => {
    serverInstance.close = jest.fn(cb => cb && cb(new Error('fail-server')));
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, mcpClient, httpServer, signals: [] });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error during HTTP server shutdown:', expect.any(Error));
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });
});
