import { serializeError } from "serialize-error";
import * as winston from "winston";

const format = winston.format.json({
  replacer: (_key, value) =>
    value instanceof Error ? serializeError(value) : value,
});

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format,
    }),
  ],
});
