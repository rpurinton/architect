import log from './log.mjs';

/**
 * Sets up shutdown handlers for the process.
 * @param {Object} options
 * @param {Object} [options.processObj=process] - The process object to attach handlers to.
 * @param {Object} [options.logger=log] - Logger for output.
 * @param {Object} [options.client=global.client] - Discord client to destroy on shutdown.
 * @param {string[]} [options.signals=['SIGTERM', 'SIGINT', 'SIGHUP']] - Signals to listen for.
 * @returns {Object} { shutdown, getShuttingDown }
 */
export const setupShutdownHandlers = ({
    processObj = process,
    logger = log,
    client = global.client,
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
            await client.destroy();
            logger.info('Discord client destroyed.');
        } catch (err) {
            logger.error('Error during client shutdown:', err);
        }
        processObj.exit(0);
    };
    signals.forEach(signal => {
        processObj.on(signal, () => shutdown(signal));
    });
    return { shutdown, getShuttingDown };
};
