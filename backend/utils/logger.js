const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ` | ${JSON.stringify(meta)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'bookstore-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Custom logging methods for specific use cases
const customLogger = {
  // Standard logging methods
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  error: (message, meta = {}) => {
    logger.error(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // API-specific logging methods
  logApiRequest: (method, url, statusCode, responseTime, userAgent = null) => {
    logger.info('API Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  logApiError: (method, url, statusCode, error, userAgent = null) => {
    logger.error('API Error', {
      method,
      url,
      statusCode,
      error: error.message,
      stack: error.stack,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  // Database-specific logging methods
  logDbQuery: (operation, collection, query, duration) => {
    logger.debug('Database Query', {
      operation,
      collection,
      query: JSON.stringify(query),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  },

  logDbError: (operation, collection, error, query = null) => {
    logger.error('Database Error', {
      operation,
      collection,
      error: error.message,
      stack: error.stack,
      query: query ? JSON.stringify(query) : null,
      timestamp: new Date().toISOString()
    });
  },

  // Business logic logging methods
  logBookOperation: (operation, bookId, details = {}) => {
    logger.info('Book Operation', {
      operation,
      bookId,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  logOrderOperation: (operation, orderId, details = {}) => {
    logger.info('Order Operation', {
      operation,
      orderId,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  logUserAction: (action, userId, details = {}) => {
    logger.info('User Action', {
      action,
      userId,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  // Security logging methods
  logSecurityEvent: (event, details = {}) => {
    logger.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  // Performance logging methods
  logPerformance: (operation, duration, details = {}) => {
    if (duration > 1000) { // Log slow operations as warnings
      logger.warn('Slow Operation', {
        operation,
        duration: `${duration}ms`,
        ...details,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.debug('Performance', {
        operation,
        duration: `${duration}ms`,
        ...details,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get logs for debugging (useful for development)
  getLogs: () => {
    // This would need to be implemented based on your needs
    // For now, we'll just return a message
    return 'Logs are written to files in the logs directory';
  },

  // Clear logs (useful for testing)
  clearLogs: () => {
    // This would need to be implemented based on your needs
    logger.info('Logs cleared', { timestamp: new Date().toISOString() });
  }
};

module.exports = customLogger;
