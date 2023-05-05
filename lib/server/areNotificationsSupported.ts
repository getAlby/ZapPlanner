import { millisecondsToHours } from "date-fns";
import ms from "ms";

export function areNotificationsSupported(sleepDuration: string) {
  return (
    millisecondsToHours(ms(sleepDuration)) >= 1 ||
    process.env.ALWAYS_ALLOW_NOTIFICATIONS === "true"
  );
}
