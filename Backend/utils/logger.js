const { createLogger, format, transports } = require('winston');

const LOG_FILE = process.env.LOG_FILE;

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'HH:mm:ss DD/MM/YYYY' }),
        format.errors({ stack: true }),
        format.printf(log => `[${log.timestamp}] [${log.level}] ${log.message} ${log.stack || ''}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: LOG_FILE })
    ],
    exitOnError: false
});

module.exports = logger;