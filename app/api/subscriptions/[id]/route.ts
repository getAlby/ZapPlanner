import { captureException } from "@sentry/nextjs";
import { StatusCodes } from "http-status-codes";
import { getSubscriptionUrl } from "lib/server/getSubscriptionUrl";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import { sendEmail } from "lib/server/sendEmail";
import { isValidEmail } from "lib/validation";
import { inngest } from "pages/api/inngest";
import { UpdateSubscriptionRequest } from "types/UpdateSubscriptionRequest";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updateSubscriptionRequest: UpdateSubscriptionRequest =
      await request.json();
    if (
      updateSubscriptionRequest.email &&
      !isValidEmail(updateSubscriptionRequest.email)
    ) {
      return new Response(undefined, {
        status: StatusCodes.BAD_REQUEST,
      });
    }

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

    const updatedSubscription = await prismaClient.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        email: updateSubscriptionRequest.email || null,
        sendPaymentNotifications:
          updateSubscriptionRequest.sendPaymentNotifications,
      },
    });
    if (updateSubscriptionRequest.email) {
      await sendEmail(updateSubscriptionRequest.email, {
        type: "subscription-updated",
        subscription: updatedSubscription,
      });
    }
    return new Response(undefined, {
      status: StatusCodes.NO_CONTENT,
    });
  } catch (error) {
    captureException(error);
    logger.error("Failed to update subscription", { error });
    return new Response("Failed to update subscription. Please try again.", {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch (error) {
    captureException(error);
    logger.error("Failed to delete subscription", { error });
    return new Response("Failed to delete subscription. Please try again.", {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
