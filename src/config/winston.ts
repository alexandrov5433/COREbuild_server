import { createLogger, format, transports } from "winston";
import path from "node:path";

const PATH_TO_ERROR_LOGS = path.resolve('../../logs/error.log');
const PATH_TO_INFO_LOGS = path.resolve('../../logs/info.log');

const errorFilter = format((info, opts) => {
    return info.level === 'error' ? info : false;
});

const infoFilter = format((info, opts) => {
    return info.level === 'info' ? info : false;
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.prettyPrint(),
        format.colorize()
    ),
    transports: [
        new transports.File({
            filename: PATH_TO_ERROR_LOGS,
            level: 'error',
            format: format.combine(errorFilter(), format.timestamp(), format.json())
        }),
        new transports.File({
            filename: PATH_TO_INFO_LOGS,
            level: 'info',
            format: format.combine(infoFilter(), format.timestamp(), format.json())
        })
    ]
});

export default logger;

// default winston log levels - 0 is of highest importance
// {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// }