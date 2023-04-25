import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";

export type UnconfirmedSubscription = Omit<
  CreateSubscriptionRequest,
  "nostrWalletConnectUrl"
>;
