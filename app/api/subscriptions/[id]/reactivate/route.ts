import { captureException } from "@sentry/nextjs";
import { StatusCodes } from "http-status-codes";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import { sendEmail } from "lib/server/sendEmail";
import { inngest } from "pages/api/inngest";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: subscriptionId } = await params;
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

    const updatedSubscription = await prismaClient.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        retryCount: 0,
        lastEventDateTime: null,
      },
    });

    await inngest.send({
      name: "zap",
      data: {
        subscriptionId: subscription.id,
      },
    });

    if (updatedSubscription.email) {
      await sendEmail(updatedSubscription.email, {
        type: "subscription-reactivated",
        subscription: updatedSubscription,
      });
    }
    return new Response(undefined, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (error) {
    captureException(error);
    logger.error("Failed to reactivate subscription", { error });
    return new Response(
      "Failed to reactivate subscription. Please try again.",
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      },
    );
  }
}
