import winston from 'winston';
import morgan from 'morgan';

// Configure Winston (for general logging)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to a separate file
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Log all messages to a combined file
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Show colored logs in console (dev only)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Configure Morgan (for HTTP request logging)
const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      response_time: tokens['response-time'](req, res) + 'ms'
    });
  },
  {
    stream: {
      write: (message) => logger.info(`HTTP Request: ${message}`)
    }
  }
);

export { logger, morganMiddleware };