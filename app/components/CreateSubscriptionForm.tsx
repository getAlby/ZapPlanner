"use client";

import { useForm } from "react-hook-form";
import { CreateSubscriptionRequest } from "types/CreateSubscriptionRequest";
import { useRouter } from "next/navigation";
import { CreateSubscriptionResponse } from "types/CreateSubscriptionResponse";
import Link from "next/link";

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
  const { push } = useRouter();
  const onSubmit = handleSubmit(async (data) => {
    const subscriptionId = await createSubscription(data);
    if (subscriptionId) {
      push(`/subscriptions/${subscriptionId}`);
    }
  });
  // firstName and lastName will have correct type

  const inputClassName = "input input-bordered w-full mb-4";

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-xs items-center bg-base-200 p-4 rounded-lg">
      <h1 className="text-lg">Add new subscription</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full">
        <label>Nostr Wallet Connect URL</label>
        <label className="text-sm">
          {"Don't have a URL? Get one with"}&nbsp;
          <Link
            className="link"
            href="https://nostr-wallet-connect.getalby.com/"
            target="_blank"
          >
            Alby
          </Link>
        </label>
        <input
          {...register("nostrWalletConnectUrl")}
          placeholder="nostrwalletconnect://..."
          className={inputClassName}
        />
        <label>Recipient Lightning address</label>
        <input {...register("lightningAddress")} className={inputClassName} />
        <label>Amount in sats</label>
        <input {...register("amount")} className={inputClassName} />
        <label>Message</label>
        <input {...register("message")} className={inputClassName} />
        <label>Repeat every</label>
        <input {...register("sleepDuration")} className={inputClassName} />
        <button type="submit" className="btn btn-primary">
          Create Subscription
        </button>
      </form>
    </div>
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
