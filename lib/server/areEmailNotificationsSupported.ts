import { millisecondsToHours } from "date-fns";
import ms from "ms";

// TODO: remove this once there are no active subscriptions with a timeframe less than one hour
/**
 * Returns true if the periodic payment timeframe is large enough to send emails
 * for payment confirmations. Short timeframes will spam the recipient and abuse the email server
 * @param sleepDuration timeframe between payments as a ms string
 * @returns true if sleepDuration is at least 1 hour
 */
export function areEmailNotificationsSupported(sleepDuration: string) {
  return (
    millisecondsToHours(ms(sleepDuration)) >= 1 ||
    process.env.ALWAYS_ALLOW_NOTIFICATIONS === "true"
  );
}
