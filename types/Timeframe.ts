// NOTE: months is not supported by ms library but
// we can support once per month via cron 0 0 1 * *
export const timeframes = ["hours", "days", "weeks", "months"] as const;

if (process.env.NEXT_PUBLIC_ALLOW_SHORT_TIMEFRAMES === "true") {
  (timeframes as unknown as string[]).unshift("seconds", "minutes");
}

export type Timeframe = (typeof timeframes)[number];
