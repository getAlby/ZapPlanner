export function getSubscriptionUrl(subscriptionId: string) {
  if (!process.env.ORIGIN) {
    throw new Error("No origin set");
  }
  return `${process.env.ORIGIN}/subscriptions/${subscriptionId}`;
}
