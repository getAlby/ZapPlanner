"use client";
import { ConfirmSubscriptionForm } from "app/confirm/components/ConfirmSubscriptionForm";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { CreateSubscriptionFormData } from "types/CreateSubscriptionFormData";

export default function ConfirmSubscriptionPage() {
  const [subscriptionValues, setSubscriptionValues] = React.useState<
    CreateSubscriptionFormData | undefined
  >();
  const { replace } = useRouter();

  React.useEffect(() => {
    const subscriptionFields = sessionStorage.getItem("fields");
    if (!subscriptionFields) {
      replace("/");
    } else {
      setSubscriptionValues(JSON.parse(subscriptionFields));
    }
  }, [replace]);

  if (!subscriptionValues) {
    return null;
  }

  return (
    <>
      <h2 className="font-heading font-bold text-2xl">Summary</h2>
      <SubscriptionSummary
        values={{
          amount: subscriptionValues.amount,
          recipientLightningAddress:
            subscriptionValues.recipientLightningAddress,
          sleepDuration:
            subscriptionValues.timeframeValue +
            " " +
            subscriptionValues.timeframe,
          message: subscriptionValues.message,
        }}
        showFirstPayment
      />
      <div className="divider my-0" />
      <h2 className="font-heading font-bold text-2xl">Link your wallet</h2>

      <p className="font-body">
        Use Nostr Wallet Connect to securely connect your bitcoin lightning
        wallet to ZapPlanner. Nostr Wallet connect is available for{" "}
        <Link href="https://nwc.getalby.com" target="_blank" className="link">
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
      <ConfirmSubscriptionForm values={subscriptionValues} />
    </>
  );
}
