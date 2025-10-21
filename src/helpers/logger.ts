import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, errors, colorize, cli } = format;
const formatLog = printf(
  ({ level, message, timestamp: dateTime }) =>
    `${dateTime} [${level}] ${message}`,
);

export const logger = createLogger({
  format: combine(errors({ stack: true }), timestamp(), formatLog),
  transports: [
    new transports.DailyRotateFile({
      dirname: './logs/',
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
