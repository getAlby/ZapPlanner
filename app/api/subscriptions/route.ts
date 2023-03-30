import { StatusCodes } from "http-status-codes";
import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { inngest } from "pages/api/inngest";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(undefined, {
      status: StatusCodes.UNAUTHORIZED,
    });
  }

  const createSubscriptionRequest: CreateSubscriptionRequest =
    await request.json();

  const subscription = await prismaClient.subscription.create({
    data: {
      amount: parseInt(createSubscriptionRequest.amount),
      recipientLightningAddress: createSubscriptionRequest.lightningAddress,
      nostrWalletConnectUrl: createSubscriptionRequest.nostrWalletConnectUrl,
      message: createSubscriptionRequest.message,
      sleepDuration: createSubscriptionRequest.sleepDuration,
      userId: session.user.id,
    },
  });

  await inngest.send({
    name: "zap",
    data: {
      subscriptionId: subscription.id,
    },
  });

  return new Response(undefined, {
    status: StatusCodes.NO_CONTENT,
  });
}
