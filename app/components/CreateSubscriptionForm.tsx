"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";

type FormData = CreateSubscriptionRequest;

export function CreateSubscriptionForm() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nostrWalletConnectUrl:
        process.env.NEXT_PUBLIC_DEFAULT_NOSTR_WALLET_CONNECT_URL,
      amount: "1",
      lightningAddress:
        process.env.NEXT_PUBLIC_DEFAULT_LIGHTNING_ADDRESS ||
        "hello@getalby.com",
      message: process.env.NEXT_PUBLIC_DEFAULT_MESSAGE,
    },
  });
  const onSubmit = handleSubmit(createSubscription);
  // firstName and lastName will have correct type

  return (
    <form onSubmit={onSubmit}>
      <label>Nostr Wallet Connect URL</label>
      <input
        {...register("nostrWalletConnectUrl")}
        placeholder="nostrwalletconnect://..."
      />
      <label>Recipient Lightning Address</label>
      <input {...register("lightningAddress")} />
      <label>Amount in sats</label>
      <input {...register("amount")} />
      <label>Message</label>
      <input {...register("message")} />
      <button type="submit">Create Subscription</button>
    </form>
  );
}

async function createSubscription(
  createSubscriptionRequest: CreateSubscriptionRequest
) {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createSubscriptionRequest),
  });
  alert(JSON.stringify(await res.json()));
}
