"use client";
import { ConfirmSubscriptionForm } from "app/confirm/components/ConfirmSubscriptionForm";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function ConfirmSubscriptionPage() {
  const subscriptionFields = sessionStorage.getItem("fields");
  const subscriptionValues =
    subscriptionFields && JSON.parse(subscriptionFields);
  const { replace } = useRouter();
  React.useEffect(() => {
    if (!subscriptionValues) {
      replace("/");
    }
  }, [replace, subscriptionValues]);

  return (
    <>
      <h2 className="font-heading font-bold text-2xl">Summary</h2>
      <SubscriptionSummary values={subscriptionValues} showFirstPayment />
      <div className="divider my-0" />
      <h2 className="font-heading font-bold text-2xl">
        Finalize with Nostr Wallet Connect
      </h2>

      <p className="font-body">
        Use{" "}
        <Link
          href="https://nostr-wallet-connect.getalby.com"
          target="_blank"
          className="link"
        >
          Nostr Wallet Connect
        </Link>{" "}
        to create new app session and securely connect your lightning wallet to
        Periodic Payments Creator.
      </p>
      <ConfirmSubscriptionForm values={subscriptionValues} />
    </>
  );
}
