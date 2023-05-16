export const timeframes = ["hours", "days", "weeks", "months"] as const;

if (process.env.NEXT_PUBLIC_ALLOW_SHORT_TIMEFRAMES === "true") {
  (timeframes as unknown as string[]).unshift("seconds", "minutes");
}

export type Timeframe = (typeof timeframes)[number];
