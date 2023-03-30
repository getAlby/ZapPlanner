"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";

type FormData = CreateSubscriptionRequest;

export function CreateSubscriptionForm() {
  const {
    register,
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
      sleepDuration: process.env.NEXT_PUBLIC_DEFAULT_SLEEP_DURATION || "30d",
    },
  });
  const { refresh } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    if (await createSubscription(data)) {
      refresh();
    }
  });
  // firstName and lastName will have correct type

  return (
    <form onSubmit={onSubmit}>
      <label>Nostr Wallet Connect URL</label>
      <input
        {...register("nostrWalletConnectUrl")}
        placeholder="nostrwalletconnect://..."
      />
      <label>Recipient Lightning address</label>
      <input {...register("lightningAddress")} />
      <label>Amount in sats</label>
      <input {...register("amount")} />
      <label>Message</label>
      <input {...register("message")} />
      <label>Repeat every</label>
      <input {...register("sleepDuration")} />
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
  if (!res.ok) {
    alert(JSON.stringify(await res.json()));
  }
  return res.ok;
}
