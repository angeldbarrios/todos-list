import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

import environment from '../config/environment';

const levelFilter = (level: string) => {
  return winston.format((info, opts) => {
    if (info.level != level) {
      return false;
    }
    return info;
  })();
};

const transports = [];

if (environment.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console());
}

transports.push(
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'info', 'log-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    // level: 'info'
    format: levelFilter('info'),
  }),
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'errors', 'error-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    level: 'error',
    format: levelFilter('error'),
  }),
);

const LoggerInstance = winston.createLogger({
  level: 'info',
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.simple(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
  ),
  transports,
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
});

export default LoggerInstance;
