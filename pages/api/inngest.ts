import "websocket-polyfill";
import crypto from "crypto";
import { webln } from "alby-js-sdk";
import { LightningAddress } from "alby-tools";
import { Inngest } from "inngest";
import { serve } from "inngest/next";
import { WebLNProvider } from "@webbtc/webln-types";
import { prismaClient } from "lib/server/prisma";
import { MAX_RETRIES } from "lib/constants";
import { logger } from "lib/server/logger";
import { areEmailNotificationsSupported } from "lib/server/areEmailNotificationsSupported";
import { sendEmail } from "lib/server/sendEmail";
import { getSubscriptionUrl } from "lib/server/getSubscriptionUrl";

global.crypto = crypto;

type PeriodicZapEvent = {
  name: "zap";
  data: {
    subscriptionId: string;
  };
};
type CancelSubscriptionEvent = {
  name: "cancel";
  data: {
    subscriptionId: string;
  };
};

type Events = {
  zap: PeriodicZapEvent;
  cancel: CancelSubscriptionEvent;
};

export const inngest = new Inngest<Events>({ name: "NWC Periodic Payments" });

const ENABLE_REPEAT_EVENTS = true;

const periodicZap = inngest.createFunction(
  {
    name: "Periodic Zap",
    cancelOn: [
      {
        event: "cancel",
        match: "data.subscriptionId",
      },
    ],
  },
  { event: "zap" },
  async ({ event, step }) => {
    const sleepDuration = await step.run("Send payment", async () => {
      const { subscriptionId } = event.data;
      const subscription = await prismaClient.subscription.findUnique({
        where: {
          id: subscriptionId,
        },
      });
      if (!subscription) {
        logger.info("No subscription found. Cancelling zap", {
          subscriptionId,
        });
        return undefined;
      }

      const { nostrWalletConnectUrl, recipientLightningAddress, amount } =
        subscription;
      const message = subscription.message ?? undefined;

      let paymentSucceeded = false;
      try {
        const noswebln = new webln.NostrWebLNProvider({
          nostrWalletConnectUrl,
        });

        // FIXME: noswebln does not fully implement WebLNProvider
        const ln = new LightningAddress(recipientLightningAddress, {
          webln: noswebln as unknown as WebLNProvider,
        });
        await ln.fetch();

        if (!ln.lnurlpData) {
          throw new Error(
            "Failed to retrieve LNURLp data for " + recipientLightningAddress
          );
        }

        logger.info("Enabling noswebln", { subscriptionId });
        await noswebln.enable();
        logger.info("Requesting invoice", { subscriptionId });
        const invoice = await ln.requestInvoice({
          satoshi: amount,
          comment:
            message &&
            ln.lnurlpData.commentAllowed &&
            ln.lnurlpData.commentAllowed >= message.length
              ? message
              : undefined,
          // TODO: only send supported payerData?
          payerdata:
            ln.lnurlpData.payerData && subscription.payerData
              ? JSON.parse(subscription.payerData)
              : undefined,
        });
        logger.info("Sending payment", { subscriptionId });
        const response = await noswebln.sendPayment(invoice.paymentRequest);
        logger.info("Done", { response, subscriptionId });

        paymentSucceeded = true;
        noswebln.close();
        logger.info("Closed noswebln", { subscriptionId });
      } catch (error) {
        logger.error("Failed to send periodic zap", { subscriptionId, error });
        //throw error;
      }
      const updatedSubscription = await prismaClient.subscription.update({
        where: {
          id: subscriptionId,
        },
        data: {
          retryCount: paymentSucceeded ? 0 : subscription.retryCount + 1,
          lastSuccessfulPaymentDateTime: paymentSucceeded
            ? new Date()
            : undefined,
          lastFailedPaymentDateTime: !paymentSucceeded ? new Date() : undefined,
          numFailedPayments:
            subscription.numFailedPayments + (paymentSucceeded ? 0 : 1),
          numSuccessfulPayments:
            subscription.numSuccessfulPayments + (paymentSucceeded ? 1 : 0),
        },
      });

      if (
        areEmailNotificationsSupported(subscription.sleepDuration) &&
        subscription.email &&
        subscription.sendPaymentNotifications
      ) {
        await sendEmail(subscription.email, {
          type: paymentSucceeded ? "payment-success" : "payment-failed",
          subscription,
        });
      }

      if (updatedSubscription.retryCount > MAX_RETRIES) {
        logger.error("subscription payment failed too many times", {
          subscriptionId,
        });
        if (subscription.email) {
          await sendEmail(subscription.email, {
            type: "subscription-deactivated",
            subscription,
          });
        }
        return undefined;
      }

      logger.info(`Sleeping for ${subscription.sleepDuration}`, {
        subscriptionId,
      });
      return subscription.sleepDuration;
    });

    if (!sleepDuration) {
      return;
    }

    await step.sleep(sleepDuration);

    if (ENABLE_REPEAT_EVENTS) {
      // create a new event object without inngest-added properties (id, ts)
      const newEvent: typeof event = { data: event.data, name: event.name };
      await step.sendEvent(newEvent);
    }

    return { event, body: "OK" };
  }
);

export default serve(inngest, [periodicZap]);
