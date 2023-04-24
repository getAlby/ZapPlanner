import { prismaClient } from "lib/server/prisma";
import { notFound } from "next/navigation";
import { CancelSubscriptionButton } from "app/components/CancelSubscriptionButton";
import { SaveSubscriptionAlert } from "app/subscriptions/[id]/components/SaveSubcriptionAlert";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import { StartNewSubscriptionForm } from "app/components/StartNewSubscriptionForm";
import { FlashAlert } from "app/components/FlashAlert";
import Link from "next/link";

export default async function SubscriptionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { returnUrl?: string };
}) {
  const subscriptionId = params.id;

  const subscription = await prismaClient.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });
  if (!subscription) {
    notFound();
  }

  return (
    <>
      <FlashAlert />
      <h2 className="font-heading font-bold text-2xl">Periodic payment</h2>
      <SubscriptionSummary
        values={{
          amount: subscription.amount.toString(),
          recipientLightningAddress: subscription.recipientLightningAddress,
          sleepDuration: subscription.sleepDuration,
          message: subscription.message || undefined,
          createdDateTime: subscription.createdDateTime,
          lastFailedPaymentDateTime:
            subscription.lastFailedPaymentDateTime ?? undefined,
          lastSuccessfulPaymentDateTime:
            subscription.lastSuccessfulPaymentDateTime ?? undefined,
          numFailedPayments: subscription.numFailedPayments,
          numSuccessfulPayments: subscription.numSuccessfulPayments,
          retryCount: subscription.retryCount,
          payerData: subscription.payerData ?? undefined,
        }}
      />
      <div className="divider my-0" />

      <SaveSubscriptionAlert />
      {searchParams?.returnUrl && (
        <Link href={searchParams.returnUrl}>
          <button className="btn btn-primary btn-block normal-case">
            Return to {searchParams.returnUrl}
          </button>
        </Link>
      )}

      <CancelSubscriptionButton subscriptionId={subscription.id} />
      <StartNewSubscriptionForm />
    </>
  );
}
