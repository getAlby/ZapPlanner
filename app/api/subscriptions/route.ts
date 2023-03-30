import { inngest } from "pages/api/inngest";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
export async function POST(request: Request) {
  const createSubscriptionRequest: CreateSubscriptionRequest =
    await request.json();

  await inngest.send({
    name: "zap",
    data: {
      lightningAddress: createSubscriptionRequest.lightningAddress,
      amount: parseInt(createSubscriptionRequest.amount),
      message: createSubscriptionRequest.message,
      nostrWalletConnectUrl: createSubscriptionRequest.nostrWalletConnectUrl,
    },
    user: {},
  });

  return new Response(JSON.stringify({ status: "OK" }));
}
