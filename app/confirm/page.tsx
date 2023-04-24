import { ConfirmSubscriptionForm } from "app/confirm/components/ConfirmSubscriptionForm";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";

type ConfirmSubscriptionPageProps = {
  searchParams?: {
    amount: string;
    recipient: string;
    timeframe: string;
    comment?: string;
    payerdata?: string;
    returnUrl?: string;
  };
};

export const dynamic = "force-dynamic";

export default function ConfirmSubscriptionPage({
  searchParams,
}: ConfirmSubscriptionPageProps) {
  if (
    !searchParams?.amount ||
    !searchParams?.recipient ||
    !searchParams?.timeframe
  ) {
    redirect("/");
  }

  const unconfirmedSubscription: UnconfirmedSubscription = {
    amount: searchParams.amount,
    recipientLightningAddress: searchParams.recipient,
    sleepDuration: decodeURIComponent(searchParams.timeframe),
    message: searchParams.comment
      ? decodeURIComponent(searchParams.comment)
      : undefined,
    payerData: searchParams.payerdata
      ? decodeURIComponent(searchParams.payerdata)
      : undefined,
  };

  return (
    <>
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
      <ConfirmSubscriptionForm
        unconfirmedSubscription={unconfirmedSubscription}
        returnUrl={searchParams.returnUrl}
      />
    </>
  );
}
