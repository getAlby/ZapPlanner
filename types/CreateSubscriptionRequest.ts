import { Timeframe } from "types/Timeframe";

export type CreateSubscriptionRequest = {
  recipientLightningAddress: string;
  amount: string;
  message?: string;
  nostrWalletConnectUrl: string;
  timeframe: Timeframe;
  timeframeValue: string;
};
