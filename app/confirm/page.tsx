import { Header } from "app/components/Header";
import { ConfirmSubscriptionForm } from "app/confirm/components/ConfirmSubscriptionForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { UnconfirmedSubscription } from "types/UnconfirmedSubscription";

type ConfirmSubscriptionPageProps = {
  searchParams: Promise<{
    amount?: string;
    recipient?: string;
    timeframe?: string;
    cron?: string;
    comment?: string;
    payerdata?: string;
    returnUrl?: string;
    nwcUrl?: string;
    currency?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ConfirmSubscriptionPage({
  searchParams,
}: ConfirmSubscriptionPageProps) {
  const {
    amount,
    recipient,
    timeframe,
    cron,
    comment,
    payerdata,
    returnUrl,
    nwcUrl,
    currency,
  } = await searchParams;

  if (!amount || !recipient || (!timeframe && !cron)) {
    redirect("/");
  }

  const unconfirmedSubscription: UnconfirmedSubscription = {
    amount: amount,
    recipientLightningAddress: recipient,
    sleepDuration: timeframe ? decodeURIComponent(timeframe) : "",
    cronExpression: cron ? decodeURIComponent(cron) : "",
    message: comment ? decodeURIComponent(comment) : undefined,
    payerData: payerdata ? decodeURIComponent(payerdata) : undefined,
    currency,
  };

  return (
    <>
      <Header />

      <ConfirmSubscriptionForm
        nwcUrl={nwcUrl}
        unconfirmedSubscription={unconfirmedSubscription}
        returnUrl={returnUrl}
      />
    </>
  );
}
