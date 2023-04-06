import { StatusCodes } from "http-status-codes";
import { prismaClient } from "lib/server/prisma";
import { inngest } from "pages/api/inngest";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
export async function POST(request: Request) {
  const createSubscriptionRequest: CreateSubscriptionRequest =
    await request.json();

  const subscription = await prismaClient.subscription.create({
    data: {
      amount: parseInt(createSubscriptionRequest.amount),
      recipientLightningAddress:
        createSubscriptionRequest.recipientLightningAddress,
      nostrWalletConnectUrl: createSubscriptionRequest.nostrWalletConnectUrl,
      message: createSubscriptionRequest.message,
      sleepDuration: createSubscriptionRequest.sleepDuration,
    },
  });

  await inngest.send({
    name: "zap",
    data: {
      subscriptionId: subscription.id,
    },
  });

  const createSubscriptionResponse: CreateSubscriptionResponse = {
    subscriptionId: subscription.id,
  };

  return new Response(JSON.stringify(createSubscriptionResponse), {
    status: StatusCodes.CREATED,
  });
}
