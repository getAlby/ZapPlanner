export const timeframes = ["hours", "days", "weeks", "months"] as const;
export type Timeframe = (typeof timeframes)[number];
