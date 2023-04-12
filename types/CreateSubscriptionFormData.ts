import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";

export type CreateSubscriptionFormData = Omit<
  CreateSubscriptionRequest,
  "nostrWalletConnectUrl"
>;
