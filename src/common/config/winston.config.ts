import winston from "winston";
import { env } from "./env.config";

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "blue",
    },
};


const isProd = env.NODE_ENV === "prod";

const devFormat = combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss A" }),
    colorize({ all: true }),
    printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
        return `${timestamp} [${level}]: ${message}${metaString}`;
    })
);

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: env.LOG_LEVEL || (isProd ? "info" : "debug"),
    format: isProd ? prodFormat : devFormat,
    transports: [new winston.transports.Console()],
    silent: env.NODE_ENV === "test",
});

winston.addColors(customLevels.colors);


export { logger };
