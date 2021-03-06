import debug from 'debug';

const loggers = {};

export default function createLogger(namespace) {
  if (!namespace) {
    throw new Error('Missing log namespace');
  }

  // default logger
  const debugLogger = debug(`sqlectron-core:${namespace}`);
  loggers[namespace] = {
    debug: debugLogger.bind(debugLogger),
    error: debugLogger.bind(debugLogger)
  };

  // The logger is load through a function
  // so is possible to access a new logger
  // defined with setLogger
  return () => loggers[namespace];
}

/**
 * Allow use a different logger
 */
export function setLogger(customLogger) {
  Object.keys(loggers).forEach(logger => {
    loggers[logger] = customLogger(logger);
  });
}
//# sourceMappingURL=Logger.js.map