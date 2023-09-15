// NOTE: months is not supported by ms library!
export const timeframes = ["hours", "days", "weeks"] as const;

if (process.env.NEXT_PUBLIC_ALLOW_SHORT_TIMEFRAMES === "true") {
  (timeframes as unknown as string[]).unshift("seconds", "minutes");
}

export type Timeframe = (typeof timeframes)[number];
