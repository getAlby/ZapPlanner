export type CreateSubscriptionRequest = {
  lightningAddress: string;
  amount: string;
  message?: string;
  nostrWalletConnectUrl: string;
  sleepDuration: string;
};
