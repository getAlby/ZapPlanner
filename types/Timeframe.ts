export const timeframes = ["hours", "days", "months"] as const;
export type Timeframe = (typeof timeframes)[number];
