"use client";
import { ConfirmSubscriptionForm } from "app/confirm/components/ConfirmSubscriptionForm";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function ConfirmSubscriptionPage({
  searchParams,
}: ConfirmSubscriptionPageProps) {
  const [unconfirmedSubscription, setUnconfirmedSubscription] = React.useState<
    UnconfirmedSubscription | undefined
  >();
  const [returnUrl, setReturnUrl] = React.useState<string | undefined>();
  const { replace } = useRouter();

  React.useEffect(() => {
    const subscriptionFields = sessionStorage.getItem("fields");

    if (
      searchParams?.amount &&
      searchParams.recipient &&
      searchParams.timeframe
    ) {
      setUnconfirmedSubscription({
        amount: searchParams.amount,
        recipientLightningAddress: searchParams.recipient,
        sleepDuration: decodeURIComponent(searchParams.timeframe),
        message: searchParams.comment,
        payerData: searchParams.payerdata
          ? decodeURIComponent(searchParams.payerdata)
          : undefined,
      });
      setReturnUrl(searchParams.returnUrl);
    } else if (subscriptionFields) {
      const unconfirmedSubscription = JSON.parse(
        subscriptionFields
      ) as UnconfirmedSubscription;

      setUnconfirmedSubscription(unconfirmedSubscription);
    } else {
      replace("/");
    }
  }, [replace, searchParams]);

  if (!unconfirmedSubscription) {
    return null;
  }

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
        returnUrl={returnUrl}
      />
    </>
  );
}
