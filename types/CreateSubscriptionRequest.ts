export type CreateSubscriptionRequest = {
  recipientLightningAddress: string;
  amount: string;
  message?: string;
  nostrWalletConnectUrl: string;
  sleepDuration: string;
};
