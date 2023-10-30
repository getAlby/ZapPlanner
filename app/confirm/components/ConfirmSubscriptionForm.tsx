"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { webln } from "@getalby/sdk";
import { Button as BitcoinConnectButton } from "@getalby/bitcoin-connect-react";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";
import { isValidNostrConnectUrl } from "lib/validation";
import { Box } from "app/components/Box";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { Button } from "app/components/Button";
import { Loading } from "app/components/Loading";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Modal } from "app/components/Modal";
import { captureException } from "@sentry/nextjs";

type FormData = CreateSubscriptionRequest;

type ConfirmSubscriptionFormProps = {
  unconfirmedSubscription: UnconfirmedSubscription;
  returnUrl?: string;
};

export function ConfirmSubscriptionForm({
  unconfirmedSubscription,
  returnUrl,
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
        process.env.NEXT_PUBLIC_DEFAULT_NOSTR_WALLET_CONNECT_URL,
    },
  });

  const [isNavigating, setNavigating] = React.useState(false);
  const { push } = useRouter();
  const hasLinkedWallet = !!watch("nostrWalletConnectUrl");

  const linkWallet = async () => {
    const nwc = webln.NostrWebLNProvider.withNewSecret(
      process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY &&
        process.env.NEXT_PUBLIC_NWC_AUTHORIZATION_URL
        ? {
            walletPubkey: process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY,
            authorizationUrl: process.env.NEXT_PUBLIC_NWC_AUTHORIZATION_URL,
          }
        : undefined,
    );
    try {
      await nwc.initNWC({
        name: `ZapPlanner (${unconfirmedSubscription.recipientLightningAddress})`,
      });
      const url = nwc.getNostrWalletConnectUrl(true);
      if (isValidNostrConnectUrl(url)) {
        setValue("nostrWalletConnectUrl", url);
      } else {
        throw new Error("Received invalid NWC URL");
      }
    } catch (error) {
      if (error) {
        console.error("Init NWC failed", error);
      }
    }
  };

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
              recipientLightningAddress:
                unconfirmedSubscription.recipientLightningAddress,
              sleepDuration: unconfirmedSubscription.sleepDuration,
              message: unconfirmedSubscription.message,
              payerData: unconfirmedSubscription.payerData,
            }}
            showFirstPayment
          />
          <div className="divider my-0" />
          <div className="flex justify-center items-start lg:px-8">
            <div className="flex flex-col gap-8 p-4 w-full relative">
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <BitcoinConnectButton
                    filters="nwc"
                    onDisconnect={() => setValue("nostrWalletConnectUrl", "")}
                    onConnect={() =>
                      setValue(
                        "nostrWalletConnectUrl",
                        (
                          window as unknown as {
                            webln: { nostrWalletConnectUrl: string };
                          }
                        ).webln.nostrWalletConnectUrl,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
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
