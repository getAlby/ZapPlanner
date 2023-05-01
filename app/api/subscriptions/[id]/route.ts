import { StatusCodes } from "http-status-codes";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import { inngest } from "pages/api/inngest";
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const subscriptionId = params.id;
  if (!subscriptionId) {
    return new Response(undefined, {
      status: StatusCodes.BAD_REQUEST,
    });
  }

  const subscription = await prismaClient.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });

  if (!subscription) {
    return new Response(undefined, {
      status: StatusCodes.NOT_FOUND,
    });
  }

  logger.info("Cancelling subscription", { subscriptionId });

  try {
    await inngest.send({
      name: "cancel",
      data: {
        subscriptionId: subscription.id,
      },
    });
  } catch (error) {
    logger.warn("Failed to cancel inngest event", { subscriptionId, error });
  }

  await prismaClient.subscription.delete({
    where: {
      id: subscriptionId,
    },
  });

  return new Response(undefined, {
    status: StatusCodes.NO_CONTENT,
  });
}
