export type CreateSubscriptionRequest = {
  recipientLightningAddress: string;
  amount: string;
  message?: string;
  payerData?: string;
  nostrWalletConnectUrl: string;
  sleepDuration: string;
};
