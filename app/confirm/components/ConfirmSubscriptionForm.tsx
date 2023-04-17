"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { CreateSubscriptionFormData } from "types/CreateSubscriptionFormData";
import { webln } from "alby-js-sdk";

type FormData = CreateSubscriptionRequest;

type ConfirmSubscriptionFormProps = {
  values: CreateSubscriptionFormData;
};

export function ConfirmSubscriptionForm({
  values,
}: ConfirmSubscriptionFormProps) {
  const { handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      ...values,
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
      name: `ZapPlanner (${values.recipientLightningAddress})`,
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
      push(`/subscriptions/${subscriptionId}`);
    }
  });

  return (
    <>
      <form id="create-subscription" onSubmit={onSubmit} className="hidden" />
      <button onClick={linkWallet}>Link wallet</button>
      {hasLinkedWallet && <p>Wallet linked!</p>}
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
