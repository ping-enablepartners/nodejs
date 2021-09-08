const logger = module.exports;

logger.warn = function (text) {
    logger.getConsole().log(`WARN: ${text}`);
};

logger.info = function (text) {
    logger.getConsole().info(`INFO: ${text}`);
};

logger.debug = function (text) {
    logger.getConsole().debug(`DEBUG: ${text}`);
};

logger.error = function (text) {
    logger.getConsole().error(`ERROR: ${text}`);
};

logger.getConsole = function () {
    if (typeof window !== "undefined" && window.console.log) {
        return window.console;
    } else if (typeof console !== "undefined" && console.log) {
        return console;
    } else {
        return {
            log: function () {
                // Do nothing
            }
        };
    }
};
