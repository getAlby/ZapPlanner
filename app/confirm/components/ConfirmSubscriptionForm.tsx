"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";
import { Box } from "app/components/Box";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import { Button } from "app/components/Button";
import { Loading } from "app/components/Loading";
import { toast } from "react-hot-toast";
import { captureException } from "@sentry/nextjs";
import { NostrWebLNProvider } from "@getalby/sdk/dist/webln";
import { DEFAULT_CURRENCY } from "lib/constants";
import dynamic from "next/dynamic";
const BitcoinConnectButton = dynamic(
  () => import("@getalby/bitcoin-connect-react").then((mod) => mod.Button),
  {
    ssr: false,
  },
);

type FormData = CreateSubscriptionRequest;

type ConfirmSubscriptionFormProps = {
  unconfirmedSubscription: UnconfirmedSubscription;
  returnUrl?: string;
  nwcUrl?: string;
  nextCronExecution?: number;
};

export function ConfirmSubscriptionForm({
  unconfirmedSubscription,
  returnUrl,
  nwcUrl,
  nextCronExecution,
}: ConfirmSubscriptionFormProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      ...unconfirmedSubscription,
      nostrWalletConnectUrl:
        nwcUrl || process.env.NEXT_PUBLIC_DEFAULT_NOSTR_WALLET_CONNECT_URL,
    },
  });

  React.useEffect(() => {
    import("@getalby/bitcoin-connect-react").then((mod) =>
      mod.init({
        filters: ["nwc"],
        appName: "ZapPlanner",
      }),
    );
  }, []);

  const [isNavigating, setNavigating] = React.useState(false);
  const { push } = useRouter();
  const hasLinkedWallet = !!watch("nostrWalletConnectUrl");

  const onSubmit = handleSubmit(async (data) => {
    if (!data.nostrWalletConnectUrl) {
      toast.error("Please connect a wallet");
      return;
    }
    const subscriptionId = await createSubscription(data);
    if (subscriptionId) {
      toast.success("Recurring payment created");
      setNavigating(true);
      push(
        `/subscriptions/${subscriptionId}${
          returnUrl ? `?returnUrl=${returnUrl}` : ""
        }`,
      );
    }
  });

  const isLoading = isSubmitting || isNavigating;

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
        <Box>
          <h2 className="font-heading font-bold text-2xl text-primary">
            Connect wallet to confirm recurring payment
          </h2>
          <SubscriptionSummary
            values={{
              amount: unconfirmedSubscription.amount,
              currency: unconfirmedSubscription.currency || DEFAULT_CURRENCY,
              recipientLightningAddress:
                unconfirmedSubscription.recipientLightningAddress,
              sleepDuration: unconfirmedSubscription.sleepDuration,
              cronExpression: unconfirmedSubscription.cronExpression,
              nextCronExecution,
              message: unconfirmedSubscription.message,
              payerData: unconfirmedSubscription.payerData,
            }}
            showFirstPayment
          />
          {!nwcUrl && (
            <>
              <div className="divider my-0" />
              <div className="flex justify-center items-start lg:px-8">
                <div className="flex flex-col gap-8 p-4 w-full relative">
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                      <BitcoinConnectButton
                        onDisconnected={() =>
                          setValue("nostrWalletConnectUrl", "")
                        }
                        onConnected={(provider) =>
                          setValue(
                            "nostrWalletConnectUrl",
                            (provider as NostrWebLNProvider).client
                              .nostrWalletConnectUrl,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Box>
        <Button
          type="submit"
          className="mt-8"
          disabled={isLoading}
          variant={hasLinkedWallet ? "primary" : "disabled"}
        >
          <div className="flex justify-center items-center gap-2">
            <span>Create Recurring Payment</span>
            {isLoading && <Loading />}
          </div>
        </Button>
      </form>
    </>
  );
}

async function createSubscription(
  createSubscriptionRequest: CreateSubscriptionRequest,
): Promise<string | undefined> {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createSubscriptionRequest),
  });
  if (!res.ok) {
    captureException(new Error("Failed to create subscription: " + res.status));
    toast.error(res.status + " " + res.statusText);
    return undefined;
  }
  const createSubscriptionResponse =
    (await res.json()) as CreateSubscriptionResponse;
  return createSubscriptionResponse.subscriptionId;
}
