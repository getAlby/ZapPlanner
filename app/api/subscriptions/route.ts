import { StatusCodes } from "http-status-codes";
import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { inngest } from "pages/api/inngest";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  const createSubscriptionRequest: CreateSubscriptionRequest =
    await request.json();

  const subscription = await prismaClient.subscription.create({
    data: {
      amount: parseInt(createSubscriptionRequest.amount),
      recipientLightningAddress: createSubscriptionRequest.lightningAddress,
      nostrWalletConnectUrl: createSubscriptionRequest.nostrWalletConnectUrl,
      message: createSubscriptionRequest.message,
      sleepDuration: createSubscriptionRequest.sleepDuration,
      userId: session?.user.id,
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
