export type CreateSubscriptionRequest = {
  recipientLightningAddress: string;
  amount: string;
  message?: string;
  currency?: string;
  payerData?: string;
  nostrWalletConnectUrl: string;
  sleepDuration?: string;
  cronExpression?: string;
  maxPayments?: string;
  endDateTime?: string;
};
