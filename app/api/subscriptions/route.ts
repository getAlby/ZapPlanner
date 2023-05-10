import { captureException } from "@sentry/nextjs";
import { StatusCodes } from "http-status-codes";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import {
  isValidLightningAddress,
  isValidNostrConnectUrl,
  isValidPositiveValue,
} from "lib/validation";
import ms from "ms";
import { inngest } from "pages/api/inngest";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
export async function POST(request: Request) {
  try {
    const createSubscriptionRequest: CreateSubscriptionRequest =
      await request.json();

    if (
      !isValidPositiveValue(parseInt(createSubscriptionRequest.amount)) ||
      ms(createSubscriptionRequest.sleepDuration) < 1000 ||
      !isValidLightningAddress(
        createSubscriptionRequest.recipientLightningAddress
      ) ||
      !isValidNostrConnectUrl(createSubscriptionRequest.nostrWalletConnectUrl)
    ) {
      return new Response("One or more invalid subscription fields", {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const subscription = await prismaClient.subscription.create({
      data: {
        amount: parseInt(createSubscriptionRequest.amount),
        recipientLightningAddress:
          createSubscriptionRequest.recipientLightningAddress,
        nostrWalletConnectUrl: createSubscriptionRequest.nostrWalletConnectUrl,
        message: createSubscriptionRequest.message,
        payerData: createSubscriptionRequest.payerData,
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

    logger.info("Created subscription", { subscriptionId: subscription.id });

    return new Response(JSON.stringify(createSubscriptionResponse), {
      status: StatusCodes.CREATED,
    });
  } catch (error) {
    captureException(error);
    logger.error("Failed to create subscription", { error });
    return new Response("Failed to create subscription. Please try again.", {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
