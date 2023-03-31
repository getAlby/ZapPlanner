import { prismaClient } from "lib/server/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CancelSubscriptionButton } from "app/components/CancelSubscriptionButton";
import { SaveSubscriptionAlert } from "app/subscriptions/[id]/components/SaveSubcriptionAlert";

export default async function SubscriptionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const subscriptionId = params.id;

  const subscription = await prismaClient.subscription.findUnique({
    where: {
      id: subscriptionId,
    },
  });
  if (!subscription) {
    notFound();
  }
  if (session && !subscription?.userId) {
    // assign the subscription to the user after login
    await prismaClient.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        userId: session.user.id,
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      {!session && <SaveSubscriptionAlert />}
      <div className="">
        <h1 className="text-xl">
          Subscription to {subscription.recipientLightningAddress}
        </h1>
        <p>
          {subscription.amount}⚡ every {subscription.sleepDuration}
        </p>
      </div>
      <div className="flex flex-1 gap-2 mt-4 items-end justify-end">
        <Link href="/">
          <button className="btn btn-sm btn-primary">
            Create Another Subscription
          </button>
        </Link>
        <CancelSubscriptionButton subscriptionId={subscription.id} goHome />
      </div>
    </div>
  );
}
