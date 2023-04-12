export const timeframes = [
  "seconds",
  "minutes",
  "hours",
  "days",
  "months",
] as const;
export type Timeframe = (typeof timeframes)[number];
