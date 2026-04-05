import pino from 'pino';
import { config } from '../config/env.js';

// Configure logger based on environment
const isDevelopment = config.NODE_ENV === 'development';
const isProduction = config.NODE_ENV === 'production';

// Logger configuration
const loggerConfig: pino.LoggerOptions = {
  level: config.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Add transport for development (pretty printing)
// pino-pretty is now in dependencies so transport should work in ESM
if (isDevelopment && process.env.USE_PRETTY !== 'false') {
  // Use pino-pretty in development for better readability
  // The transport option spawns a worker thread for pretty printing
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

// Add production-specific configuration
if (isProduction) {
  loggerConfig.base = {
    env: config.NODE_ENV,
  };
}

export const logger = pino(loggerConfig);