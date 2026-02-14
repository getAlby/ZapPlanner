import { Header } from "app/components/Header";
import { ConfirmSubscriptionForm } from "app/confirm/components/ConfirmSubscriptionForm";
import { getNextCronExecution } from "lib/utils";
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
    maxPayments?: string;
    endDateTime?: string;
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
    maxPayments,
    endDateTime,
  } = await searchParams;

  if (!amount || !recipient || (!timeframe && !cron)) {
    redirect("/");
  }

  const unconfirmedSubscription: UnconfirmedSubscription = {
    amount: amount,
    recipientLightningAddress: recipient,
    sleepDuration: timeframe ? decodeURIComponent(timeframe) : undefined,
    cronExpression: cron ? decodeURIComponent(cron) : undefined,
    message: comment ? decodeURIComponent(comment) : undefined,
    payerData: payerdata ? decodeURIComponent(payerdata) : undefined,
    currency,
    maxPayments: maxPayments,
    endDateTime: endDateTime,
  };

  return (
    <>
      <Header />

      <ConfirmSubscriptionForm
        nwcUrl={nwcUrl}
        unconfirmedSubscription={unconfirmedSubscription}
        returnUrl={returnUrl}
        nextCronExecution={
          unconfirmedSubscription.cronExpression
            ? getNextCronExecution(
                unconfirmedSubscription.cronExpression,
              ).getTime()
            : undefined
        }
      />
    </>
  );
}
