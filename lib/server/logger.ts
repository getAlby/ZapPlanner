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
    ...(process.env.DATADOG_API_KEY
      ? [
          new winston.transports.Http({
            host: "http-intake.logs.datadoghq.eu",
            path: `/api/v2/logs?dd-api-key=${process.env.DATADOG_API_KEY}&ddsource=zapplanner&service=zapplanner`,
            ssl: true,
            format,
          }),
        ]
      : []),
  ],
});
