import { prismaClient } from "lib/server/prisma";
import { notFound } from "next/navigation";
import { Header } from "app/components/Header";
import { SubscriptionPageForm } from "app/subscriptions/[id]/components/SubscriptionPageForm";
import { CancelSubscriptionButton } from "app/components/CancelSubscriptionButton";
import { SubscriptionSummary } from "app/confirm/components/SubscriptionSummary";
import { areEmailNotificationsSupported } from "lib/server/areEmailNotificationsSupported";
import Link from "next/link";
import { MAX_RETRIES } from "lib/constants";
import { ReactivateSubscriptionButton } from "app/components/ReactivateSubscriptionButton";

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
      <Header />
      <SubscriptionPageForm
        formFields={{
          sendPaymentNotifications: subscription.sendPaymentNotifications,
          email: subscription.email || "",
        }}
        subscriptionId={subscription.id}
        emailNotificationsSupported={areEmailNotificationsSupported(
          subscription.sleepDuration
        )}
        beforeFormContent={
          <>
            <h2 className="font-heading font-bold text-2xl text-primary">
              Periodic payment
            </h2>
            <SubscriptionSummary
              values={{
                amount: subscription.amount.toString(),
                recipientLightningAddress:
                  subscription.recipientLightningAddress,
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
            {subscription.retryCount >= MAX_RETRIES && (
              <ReactivateSubscriptionButton subscriptionId={subscription.id} />
            )}
            <CancelSubscriptionButton subscriptionId={subscription.id} />
            <div className="divider my-0" />

            <p className="font-body">
              Bookmark this page or provide your email so you can access this
              periodic payment If you wish to cancel it. You can also delete the
              NWC connection to cancel this periodic payment.
            </p>
          </>
        }
      />
      {searchParams?.returnUrl && (
        <div className="w-full max-w-xs flex flex-col justify-center items-center">
          <div className="divider mb-8" />
          <Link href={searchParams?.returnUrl}>
            <button className="btn btn-primary btn-sm normal-case">
              Return to {searchParams?.returnUrl}
            </button>
          </Link>
        </div>
      )}
    </>
  );
}
