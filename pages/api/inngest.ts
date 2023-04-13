import "websocket-polyfill";
import crypto from "crypto";
import { webln } from "alby-js-sdk";
import { LightningAddress } from "alby-tools";
import { Inngest } from "inngest";
import { serve } from "inngest/next";
import { WebLNProvider } from "@webbtc/webln-types";
import { Event, NostrProvider } from "alby-tools/dist/types";
import { signEvent, getPublicKey, getEventHash } from "nostr-tools";
import { prismaClient } from "lib/server/prisma";
import { MAX_RETRIES } from "lib/constants";

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
const SEND_ZAP = false;

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
        console.log(
          "No subscription found matching " +
            subscriptionId +
            ". Cancelling zap"
        );
        return undefined;
      }

      const { nostrWalletConnectUrl, recipientLightningAddress, amount } =
        subscription;
      const message = subscription.message ?? undefined;

      let paymentSucceeded = false;
      try {
        const noswebln = new webln.NostrWebLNProvider({
          relayUrl: "wss://relay.getalby.com/v1",
          nostrWalletConnectUrl,
        });

        // FIXME: noswebln does not fully implement WebLNProvider
        const ln = new LightningAddress(recipientLightningAddress, {
          webln: noswebln as unknown as WebLNProvider,
        });
        await ln.fetch();

        if (SEND_ZAP) {
          await sendZap(ln, noswebln, amount, message);
        } else {
          await sendStandardPayment(ln, amount, message, noswebln);
        }
        paymentSucceeded = true;
        noswebln.close();
        console.log("Closed noswebln");
      } catch (error) {
        console.error("Failed to send periodic zap", error);
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

      if (updatedSubscription.retryCount > MAX_RETRIES) {
        console.error(
          "subscription " + subscriptionId + " payment failed too many times"
        );
        return undefined;
      }

      console.log(`Sleeping for ${subscription.sleepDuration}`);
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

async function sendZap(
  ln: LightningAddress,
  noswebln: webln.NostrWebLNProvider,
  amount: number,
  message: string | undefined
) {
  const DEFAULT_ZAP_RELAYS = [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.nostr.bg",
    "wss://brb.io",
  ];

  const privateKey = noswebln.secret;

  if (!privateKey || privateKey.length !== 64) {
    throw new Error("nostrWalletConnectUrl does not contain a valid secret");
  }
  const pubkey = getPublicKey(privateKey);
  // TODO: use noswebln instead of creating a NostrProvider
  const nostr: NostrProvider = {
    getPublicKey: () => Promise.resolve(pubkey),
    signEvent: ((event: Event) => {
      const signedEvent = {
        ...event,
        pubkey,
      };

      signedEvent.id = getEventHash(signedEvent);
      signedEvent.sig = signEvent(signedEvent, privateKey);
      console.error("Signed event: " + event.kind);
      return Promise.resolve(signedEvent);
    }) as unknown as () => Promise<Event> /*FIXME: remove cast when alby-tools is updated*/,
  };

  console.log("Sending zap...");
  const response = await ln.zap(
    {
      satoshi: amount,
      comment: message,
      relays: DEFAULT_ZAP_RELAYS,
    },
    {
      nostr,
    }
  );
  console.error("Zap done", response);
}

async function sendStandardPayment(
  ln: LightningAddress,
  amount: number,
  message: string | undefined,
  noswebln: webln.NostrWebLNProvider
) {
  console.log("Enabling noswebln");
  await noswebln.enable();
  console.log("Requesting invoice");
  const invoice = await ln.requestInvoice({
    satoshi: amount,
    comment: message,
  });
  console.log("Sending payment");
  const response = await noswebln.sendPayment(invoice.paymentRequest);
  console.log("Done", response);
}
