"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import React from "react";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";
import { isValidNostrConnectUrl } from "lib/validation";
const inputClassName = "input input-bordered w-full mb-4";
const labelClassName = "font-body font-medium";

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
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...unconfirmedSubscription,
      nostrWalletConnectUrl:
        process.env.NEXT_PUBLIC_DEFAULT_NOSTR_WALLET_CONNECT_URL,
    },
  });

  const { push } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
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
    <form
      id="create-subscription"
      onSubmit={onSubmit}
      className="flex flex-col gap-2 w-full"
    >
      <label className={labelClassName}>Nostr Wallet Connect URL</label>

      <input
        {...register("nostrWalletConnectUrl", {
          validate: (value) =>
            isValidNostrConnectUrl(value) ? undefined : "Invalid NWC url",
        })}
        placeholder="nostr+walletconnect://..."
        className={inputClassName}
        type="password"
      />
      {errors.nostrWalletConnectUrl && (
        <p className="text-error">{errors.nostrWalletConnectUrl.message}</p>
      )}
    </form>
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
