// A faulty API route to test Sentry's error monitoring
// TODO: REMOVE after testing
export default function handler(_req, res) {
  throw new Error("Sentry Example API Route Error");
}
