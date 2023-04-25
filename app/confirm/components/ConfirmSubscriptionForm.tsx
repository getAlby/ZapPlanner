"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { webln } from "alby-js-sdk";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";

type FormData = CreateSubscriptionRequest;

type ConfirmSubscriptionFormProps = {
  unconfirmedSubscription: UnconfirmedSubscription;
  returnUrl?: string;
};

export function ConfirmSubscriptionForm({
  unconfirmedSubscription,
  returnUrl,
}: ConfirmSubscriptionFormProps) {
  const { handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      ...unconfirmedSubscription,
      nostrWalletConnectUrl:
        process.env.NEXT_PUBLIC_DEFAULT_NOSTR_WALLET_CONNECT_URL,
    },
  });

  const { push } = useRouter();
  const hasLinkedWallet = !!watch("nostrWalletConnectUrl");

  const linkWallet = async () => {
    const nwc = webln.NostrWebLNProvider.withNewSecret({
      walletPubkey: process.env.NEXT_PUBLIC_NWC_WALLET_PUBKEY,
    });
    await nwc.initNWC(process.env.NEXT_PUBLIC_NWC_NEW_APP_URL || "alby", {
      name: `ZapPlanner (${unconfirmedSubscription.recipientLightningAddress})`,
    });

    setValue("nostrWalletConnectUrl", nwc.getNostrWalletConnectUrl(true));
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!data.nostrWalletConnectUrl) {
      alert("Please link your wallet");
      return;
    }
    const subscriptionId = await createSubscription(data);
    if (subscriptionId) {
      sessionStorage.setItem("flashAlert", "subscriptionCreated");
      push(
        `/subscriptions/${subscriptionId}${
          returnUrl ? `?returnUrl=${returnUrl}` : ""
        }`
      );
    }
  });

  return (
    <>
      <form id="create-subscription" onSubmit={onSubmit} className="hidden" />
      <div className="flex justify-center">
        {!hasLinkedWallet ? (
          <button
            onClick={linkWallet}
            className="shadow w-80 h-14 rounded-md font-body font-bold hover:opacity-80 text-white text-lg"
            style={{
              background:
                "linear-gradient(180deg, #A939C2 63.72%, #9A34B1 95.24%)",
            }}
          >
            Link Wallet
          </button>
        ) : (
          <div className="bg-green-50 p-3 rounded-md w-full">
            <p className="font-body text-green-700 text-sm font-medium">
              ✅ Wallet linked
            </p>
          </div>
        )}
      </div>
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
    alert(res.status + " " + res.statusText);
    return undefined;
  }
  const createSubscriptionResponse =
    (await res.json()) as CreateSubscriptionResponse;
  return createSubscriptionResponse.subscriptionId;
}
