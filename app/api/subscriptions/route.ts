import { captureException } from "@sentry/nextjs";
import { StatusCodes } from "http-status-codes";
import { logger } from "lib/server/logger";
import { prismaClient } from "lib/server/prisma";
import {
  isValidNostrConnectUrl,
  isValidPositiveValue,
  validateLightningAddress,
} from "lib/validation";
import ms from "ms";
import { inngest } from "pages/api/inngest";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import { SATS_CURRENCY } from "lib/constants";
import { fiat } from "@getalby/lightning-tools";

export async function POST(request: Request) {
  try {
    const createSubscriptionRequest: CreateSubscriptionRequest =
      await request.json();

    const sleepDurationMs = ms(createSubscriptionRequest.sleepDuration);

    if (
      !isValidPositiveValue(parseInt(createSubscriptionRequest.amount)) ||
      !sleepDurationMs ||
      (process.env.NEXT_PUBLIC_ALLOW_SHORT_TIMEFRAMES !== "true" &&
        sleepDurationMs < 60 * 60 * 1000) ||
      !isValidNostrConnectUrl(createSubscriptionRequest.nostrWalletConnectUrl)
    ) {
      return new Response("One or more invalid subscription fields", {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    let satoshi = +createSubscriptionRequest.amount;
    if (
      createSubscriptionRequest.currency &&
      createSubscriptionRequest.currency !== SATS_CURRENCY
    ) {
      // check the currency exists
      const response = await fetch(
        `https://getalby.com/api/rates/${createSubscriptionRequest.currency}.json`,
      );
      if (!response.ok) {
        throw new Error(
          "Failed to fetch rates for currency: " +
            createSubscriptionRequest.currency,
        );
      }

      satoshi = await fiat.getSatoshiValue({
        amount: createSubscriptionRequest.amount,
        currency: createSubscriptionRequest.currency,
      });
    }

    const { errorMessage } = await validateLightningAddress(
      createSubscriptionRequest.recipientLightningAddress,
      satoshi,
    );

    if (errorMessage) {
      return new Response(errorMessage, {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const subscription = await prismaClient.subscription.create({
      data: {
        amount: parseInt(createSubscriptionRequest.amount),
        currency: createSubscriptionRequest.currency,
        recipientLightningAddress:
          createSubscriptionRequest.recipientLightningAddress,
        nostrWalletConnectUrl: createSubscriptionRequest.nostrWalletConnectUrl,
        message: createSubscriptionRequest.message,
        payerData: createSubscriptionRequest.payerData,
        sleepDuration: createSubscriptionRequest.sleepDuration,
        sleepDurationMs,
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
