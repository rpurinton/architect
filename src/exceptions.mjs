import log from './log.mjs';

/**
 * Registers process-level exception handlers for uncaught exceptions, unhandled rejections, warnings, and exit events.
 * @param {Object} processObj - The process object to attach handlers to (default: process).
 * @param {Object} logger - Logger for output (default: log).
 * @returns {Object} { removeHandlers } - Function to remove all registered handlers (for testability).
 */
export const registerExceptionHandlers = (processObj = process, logger = log) => {
    const safeString = (err) => {
        if (err instanceof Error) return err.stack || err.message;
        if (typeof err === 'object') return JSON.stringify(err);
        return String(err);
    };
    const handlers = {
        uncaughtException: (err) => logger.error('Uncaught Exception:', safeString(err)),
        unhandledRejection: (reason, promise) => {
            const reasonStr = safeString(reason);
            const promiseInfo = promise && promise.constructor ? `Promise type: ${promise.constructor.name}` : '';
            const stack = (reason && reason.stack) ? `\nStack: ${reason.stack}` : '';
            logger.error(`Unhandled Rejection at: ${promiseInfo} reason: ${reasonStr}${stack}`);
            if (typeof Error.captureStackTrace === 'function') {
                const err = {};
                Error.captureStackTrace(err, handlers.unhandledRejection);
                logger.error('UnhandledRejection handler stack trace:', err.stack);
            }
        },
        warning: (warning) => logger.warn('Warning:', warning.name, warning.message),
        exit: (code) => logger.info(`Process exiting with code: ${code}`)
    };
    processObj.on('uncaughtException', handlers.uncaughtException);
    processObj.on('unhandledRejection', handlers.unhandledRejection);
    processObj.on('warning', handlers.warning);
    processObj.on('exit', handlers.exit);
    const removeHandlers = () => {
        processObj.off('uncaughtException', handlers.uncaughtException);
        processObj.off('unhandledRejection', handlers.unhandledRejection);
        processObj.off('warning', handlers.warning);
        processObj.off('exit', handlers.exit);
    };
    return { removeHandlers };
};
