"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { webln } from "alby-js-sdk";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";
import { isValidNostrConnectUrl } from "lib/validation";
import { Box } from "app/components/Box";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { Button } from "app/components/Button";
import { Loading } from "app/components/Loading";
import { toast } from "react-hot-toast";

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
        : undefined
    );
    await nwc.initNWC({
      name: `ZapPlanner (${unconfirmedSubscription.recipientLightningAddress})`,
    });

    setValue("nostrWalletConnectUrl", nwc.getNostrWalletConnectUrl(true));
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!data.nostrWalletConnectUrl) {
      toast.error("Please link your wallet");
      return;
    }
    const subscriptionId = await createSubscription(data);
    if (subscriptionId) {
      toast.success("Periodic payment created");
      push(
        `/subscriptions/${subscriptionId}${
          returnUrl ? `?returnUrl=${returnUrl}` : ""
        }`
      );
    }
  });

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
        <Box>
          <h2 className="font-heading font-bold text-2xl">Summary</h2>
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
          <h2 className="font-heading font-bold text-2xl">Link your wallet</h2>

          <p className="font-body">
            Use Nostr Wallet Connect to securely connect your bitcoin lightning
            wallet to ZapPlanner. Nostr Wallet connect is available for{" "}
            <Link
              href="https://nwc.getalby.com"
              target="_blank"
              className="link"
            >
              Alby accounts
            </Link>
            ,{" "}
            <Link
              href="https://github.com/getAlby/umbrel-community-app-store"
              target="_blank"
              className="link"
            >
              {" "}
              Umbrel wallets
            </Link>
            , etc.
          </p>

          <div className="flex justify-center">
            {!hasLinkedWallet ? (
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={linkWallet}
                  className="shadow w-80 h-14 rounded-md font-body font-bold hover:opacity-80 text-white text-lg"
                  style={{
                    background:
                      "linear-gradient(180deg, #A939C2 63.72%, #9A34B1 95.24%)",
                  }}
                >
                  Link Wallet
                </button>
                <span className="text-xs mt-4 mb-1">
                  or paste a NWC url below:
                </span>
                <input
                  className="input input-bordered w-64 input-sm"
                  placeholder="nostrwalletconnect://..."
                  onChange={(e) =>
                    isValidNostrConnectUrl(e.target.value)
                      ? setValue("nostrWalletConnectUrl", e.target.value)
                      : toast.error("invalid NWC url")
                  }
                  value=""
                  type="password"
                />
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-md w-full">
                <p className="font-body text-green-700 text-sm font-medium">
                  ✅ Wallet linked
                </p>
              </div>
            )}
          </div>
        </Box>
        <Button type="submit" className="mt-8" disabled={isSubmitting}>
          <div className="flex justify-center items-center gap-2">
            <span>Create Periodic Payment</span>
            {isSubmitting && <Loading />}
          </div>
        </Button>
      </form>
    </>
  );
}

async function createSubscription(
  createSubscriptionRequest: CreateSubscriptionRequest
): Promise<string | undefined> {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createSubscriptionRequest),
  });
  if (!res.ok) {
    toast.error(res.status + " " + res.statusText);
    return undefined;
  }
  const createSubscriptionResponse =
    (await res.json()) as CreateSubscriptionResponse;
  return createSubscriptionResponse.subscriptionId;
}
