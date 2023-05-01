import { Header } from "app/components/Header";
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
      <Header />

      <ConfirmSubscriptionForm
        unconfirmedSubscription={unconfirmedSubscription}
        returnUrl={searchParams.returnUrl}
      />
    </>
  );
}
