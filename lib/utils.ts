import { CronExpressionParser } from "cron-parser";

export function isError(obj: any) {
  return Object.prototype.toString.call(obj) === "[object Error]";
}

/**
 * Calculate the next execution time for a cron expression
 */
export function getNextCronExecution(cronExpression: string): Date {
  try {
    const interval = CronExpressionParser.parse(cronExpression);
    return interval.next().toDate();
  } catch (error) {
    console.error("Invalid cron expression:", cronExpression, error);
    throw error;
  }
}

/**
 * Validate a cron expression
 */
export function isValidCronExpression(cronExpression: string): boolean {
  try {
    CronExpressionParser.parse(cronExpression);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate milliseconds until next cron execution
 */
export function getCronNextExecutionFromNow(
  cronExpression: string,
): number | null {
  const nextExecution = getNextCronExecution(cronExpression);
  if (!nextExecution) return null;

  const now = new Date();
  const diffMs = nextExecution.getTime() - now.getTime();

  if (diffMs <= 0) return null;

  return diffMs;
}
