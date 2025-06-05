import log from './log.mjs';

/**
 * Sets up shutdown handlers for the process.
 * @param {Object} options
 * @param {Object} [options.processObj=process] - The process object to attach handlers to.
 * @param {Object} [options.logger=log] - Logger for output.
 * @param {Object} [options.client=global.client] - Discord client to destroy on shutdown.
 * @param {Object} [options.mcpServer=global.mcpServer] - MCP server to close on shutdown.
 * @param {Object} [options.mcpClient=global.mcpClient] - MCP client to close on shutdown.
 * @param {Object} [options.httpServer=global.httpServer] - HTTP server to close on shutdown.
 * @param {string[]} [options.signals=['SIGTERM', 'SIGINT', 'SIGHUP']] - Signals to listen for.
 * @returns {Object} { shutdown, getShuttingDown }
 */
export const setupShutdownHandlers = ({
    processObj = process,
    logger = log,
    client = global.client,
    mcpServer = global.mcpServer,
    mcpClient = global.mcpClient,
    httpServer = global.httpServer,
    signals = ['SIGTERM', 'SIGINT', 'SIGHUP']
} = {}) => {
    let shuttingDown = false;
    const getShuttingDown = () => shuttingDown;
    const shutdown = async (signal) => {
        if (shuttingDown) {
            logger.warn(`Received ${signal} again, but already shutting down.`);
            return;
        }
        shuttingDown = true;
        logger.info(`Received ${signal}. Shutting down gracefully...`);
        try {
            if (client && typeof client.destroy === 'function') {
                await client.destroy();
                logger.info('Discord client destroyed.');
            }
        } catch (err) {
            logger.error('Error during client shutdown:', err);
        }
        try {
            if (mcpClient && typeof mcpClient.close === 'function') {
                await mcpClient.close();
                logger.info('MCP client closed.');
            }
        } catch (err) {
            logger.error('Error during MCP client shutdown:', err);
        }
        try {
            if (mcpServer && typeof mcpServer.close === 'function') {
                await mcpServer.close();
                logger.info('MCP server closed.');
            }
        } catch (err) {
            logger.error('Error during MCP server shutdown:', err);
        }
        try {
            if (httpServer && typeof httpServer.serverInstance?.close === 'function') {
                await new Promise((resolve, reject) => {
                    httpServer.serverInstance.close((err) => {
                        if (err) {
                            logger.error('Error during HTTP server shutdown:', err);
                            reject(err);
                        } else {
                            logger.info('HTTP server closed.');
                            resolve();
                        }
                    });
                });
            }
        } catch (err) {
            logger.error('Error during HTTP server shutdown:', err);
        }
        processObj.exit(0);
    };
    signals.forEach(signal => {
        processObj.on(signal, () => shutdown(signal));
    });
    return { shutdown, getShuttingDown };
};
