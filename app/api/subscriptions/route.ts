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
import { RestartStuckSubscriptionsResponse } from "types/RestartStuckSubscriptionsResponse";
import { RestartStuckSubscriptionsRequest } from "types/RestartStuckSubscriptionsRequest";
import { isValidCronExpression, getCronSleepDurationMs } from "lib/utils";

export async function POST(request: Request) {
  try {
    const createSubscriptionRequest: CreateSubscriptionRequest =
      await request.json();

    let sleepDurationMs: number | null = null;

    if (createSubscriptionRequest.cronExpression) {
      if (!isValidCronExpression(createSubscriptionRequest.cronExpression)) {
        return new Response("Invalid cron expression", {
          status: StatusCodes.BAD_REQUEST,
        });
      }
      if (/^[0-5]?[0-9] /g.test(createSubscriptionRequest.cronExpression)) {
        return new Response("Cron expression must repeat only once per hour", {
          status: StatusCodes.BAD_REQUEST,
        });
      }
      sleepDurationMs = getCronSleepDurationMs(
        createSubscriptionRequest.cronExpression,
      );
      if (!sleepDurationMs) {
        return new Response("Cron expression would execute in the past", {
          status: StatusCodes.BAD_REQUEST,
        });
      }
    } else {
      sleepDurationMs = ms(createSubscriptionRequest.sleepDuration);
    }

    if (
      !isValidPositiveValue(parseInt(createSubscriptionRequest.amount)) ||
      !sleepDurationMs ||
      (process.env.NEXT_PUBLIC_ALLOW_SHORT_TIMEFRAMES !== "true" &&
        !createSubscriptionRequest.cronExpression &&
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
        cronExpression: createSubscriptionRequest.cronExpression,
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
export async function PATCH(request: Request) {
  try {
    const restartStuckSubscriptionsRequest: RestartStuckSubscriptionsRequest =
      await request.json();

    // it is possible to do the full query in SQL rather than filtering in memory
    // but there are not that many subscriptions right now and makes the code more complicated
    // as it must be a raw SQL query
    /*
      SELECT "lastEventDateTime", "sleepDurationMs"
      FROM "Subscription"
      WHERE "numFailedPayments" < 3 AND
      "lastEventDateTime" > '2025-01-01' AND
      "lastEventDateTime" < (CURRENT_TIMESTAMP - ("sleepDurationMs" / 1000) * interval '1 second' )
      ORDER by "lastEventDateTime" desc;
    */
    const activeSubscriptions = await prismaClient.subscription.findMany({
      where: {
        numFailedPayments: {
          lt: 3,
        },
        lastEventDateTime: {
          gt: new Date("2025-01-01"),
        },
      },
    });

    // find subscriptions more than an hour behind schedule
    const buffer = 1000 * 60 * 60;

    const stuckSubscriptions = activeSubscriptions.filter(
      (subscription) =>
        subscription.lastEventDateTime &&
        Date.now() - subscription.lastEventDateTime.getTime() >
          Number(subscription.sleepDurationMs) + buffer,
    );

    logger.info("Found stuck subscriptions", {
      count: stuckSubscriptions.length,
    });

    let processed = 0;
    for (const subscription of stuckSubscriptions) {
      if (processed >= restartStuckSubscriptionsRequest.count) {
        logger.info("Hit limit of stuck subscriptions to restart", {
          processed,
        });
        break;
      }
      logger.info("Restarting stuck subscription", {
        subscriptionId: subscription.id,
      });
      await inngest.send({
        name: "zap",
        data: {
          subscriptionId: subscription.id,
        },
      });
      ++processed;
    }

    const restartStuckSubscriptionsResponse: RestartStuckSubscriptionsResponse =
      {
        processed,
        total: stuckSubscriptions.length,
      };

    return new Response(JSON.stringify(restartStuckSubscriptionsResponse), {
      status: StatusCodes.OK,
    });
  } catch (error) {
    captureException(error);
    logger.error("Failed to restart stuck subscriptions", { error });
    return new Response(
      "Failed to restart stuck subscriptions. Please try again.",
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      },
    );
  }
}
