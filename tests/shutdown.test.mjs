import { jest } from '@jest/globals';
import { setupShutdownHandlers } from '../src/shutdown.mjs';

describe('setupShutdownHandlers', () => {
  let processObj;
  let logger;
  let client;
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
    global.httpInstance = { close: jest.fn(cb => cb && cb()) };
    global.mcpServer = { close: jest.fn().mockResolvedValue() };
  });

  it('registers signal handlers and returns shutdown/getShuttingDown', () => {
    const { shutdown, getShuttingDown } = setupShutdownHandlers({ processObj, logger, client, signals: ['SIGINT'] });
    expect(processObj.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(typeof shutdown).toBe('function');
    expect(typeof getShuttingDown).toBe('function');
  });

  it('shutdown only runs once and calls client.destroy', async () => {
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, signals: [] });
    await shutdown('SIGINT');
    expect(logger.info).toHaveBeenCalledWith('Received SIGINT. Shutting down gracefully...');
    expect(client.destroy).toHaveBeenCalled();
    expect(global.httpInstance.close).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('HTTP server stopped.');
    expect(global.mcpServer.close).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('MCP server stopped.');
    expect(processObj.exit).toHaveBeenCalledWith(0);
    await shutdown('SIGINT');
    expect(logger.warn).toHaveBeenCalledWith('Received SIGINT again, but already shutting down.');
  });

  it('logs error if client.destroy throws', async () => {
    client.destroy.mockRejectedValue(new Error('fail'));
    global.httpInstance = { close: jest.fn(cb => cb && cb()) };
    global.mcpServer = { close: jest.fn().mockResolvedValue() };
    const { shutdown } = setupShutdownHandlers({ processObj, logger, client, signals: [] });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error during client shutdown:', expect.any(Error));
    expect(global.httpInstance.close).toHaveBeenCalled();
    expect(global.mcpServer.close).toHaveBeenCalled();
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });
});
